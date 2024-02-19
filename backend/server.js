import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import { db, connect } from './db.js';
import cors from 'cors';
import { addHours, add, addMonths, sub} from 'date-fns';
import  scheduler  from './scheduler.js';

const credentials = JSON.parse(fs.readFileSync('credentials.json'));
admin.initializeApp({ credential: admin.credential.cert(credentials), });

const app = express();
app.use(cors());
app.use(express.json());
scheduler()

//check auth
app.use(async (req, res, next) => {
    const { authtoken } = req.headers;

    if (authtoken) {
        try {
            const user = await admin.auth().verifyIdToken(authtoken);
            req.user = user;
        }
        catch (err) {
            return res.sendStatus(400);
        }
    }

    req.user = req.user || {};
    next();
})

app.use((req, res, next) => {
    if (req.user)
        next();
    else
        res.status(401);

})

//creates a user
app.post('/api/create-user/:token', async (req, res) => {
    const { email } = req.body;
    const { uid } = req.user;
    const { name } = req.body;


    await db.collection('users').insertOne({
        uid: uid,
        email: email,
        name: name,
        groupids: [],
    })

    const user = await db.collection('users').findOne({ uid });
    

    if (user)
        res.json(user)
    else
        res.status(404).send('Not found :(')


});

//gets a group and returns all group information like group id, name, owner of group, newsletter cutoff, and array of who can post
app.get('/api/groups', async (req, res) => {
    const { uid } = req.user;
    const user = await db.collection('users').findOne({ uid });

    if (user) {
        const groupids = user.groupids;
        var groups = []

        for (let gid of groupids) {
            let group = await db.collection('groups').findOne({ gid });
            if (group) {
                groups.push({ gid: gid, name: group.name, owner: group.users[0] === uid, cantPost: group.cantPost, cutoffDate: group.cutoffDate })
            }
        }
        res.send(groups)
    }
    else
        res.status(404).send('Not found :(')
})

// creates a group
app.post('/api/create-group/:gid', async (req, res) => {
    const { gid } = req.params
    const { uid } = req.user;
    const { name } = req.body;
    const { password } = req.body;
    const { frequency } = req.body;
    var cutoffDate = getCutoff(frequency);

    
    await db.collection('groups').insertOne({
        gid: gid,
        name: name,
        password: password,
        users: [uid],
        partials: [],
        newsletters: [],
        frequency: frequency,
        cantPost: [],
        cutoffDate: cutoffDate,
    })
    const group = await db.collection('groups').findOne({ gid });

    if (group) {
        await db.collection('users').updateOne({ uid }, {
            $addToSet: { groupids: gid },
        })

        res.json(group)
    }
    else
        res.status(404).send('Not found :(')

});

//allows user to join a group 
app.put('/api/join-group/:gid', async (req, res) => {
    const { gid } = req.params;
    const { uid } = req.user;
    const { password } = req.body;

    const group = await db.collection('groups').findOne({ gid });

    if (group) {
        if (password === group.password) {
            await db.collection('users').updateOne({ uid }, {
                $addToSet: { groupids: gid },
            })
            await db.collection('groups').updateOne({ gid }, {
                $addToSet: { users: uid },
            })

            res.json(group);
        }
        else res.status(406).send('Wrong password')
    }
    else
        res.status(404).send('Not found :(')

})
//allows user to leave a group. doesn't actually delete the group if user is creator
app.put('/api/delete-group/:gid', async (req, res) => {
    const { gid } = req.params;
    const { uid } = req.user;

    const group = await db.collection('groups').findOne({ gid });
    const user = await db.collection('users').findOne({ uid });

    if (group) {
        await db.collection('groups').updateOne({ gid }, {
            $pull: { users: uid },
        })
    }
    else
        res.status(404).send('Not found :(')

    if (user) {
        await db.collection('users').updateOne({ uid }, {
            $pull: { groupids: gid },
        })
        res.status(200).send()
    }
    else
        res.status(404).send('Not found :(')

});

//gets all newsletters associated with a group.
app.get('/api/newsletters/:gid', async (req, res) => {
    const { gid } = req.params;

    const group = await db.collection('groups').findOne({ gid });

    if (group) {
        const newsletters = []
        for (let nid of group.newsletters) {
            let newsletter = await db.collection('newsletters').findOne({ nid });
            if (newsletter) {
                newsletters.push({ gid: newsletter.group, groupName: newsletter.groupName, newsletterParts: newsletter.newsletter, date: newsletter.date })
            }
        }
        res.json(newsletters);
    }
    else
        res.status(404).send('Not found :(')

})

//takes user aaddition to newsletter and stores it in db
app.put('/api/post-partials', async (req, res) => {
    const { uid } = req.user;
    const { gid } = req.body;
    const { text } = req.body;
    const { date } = req.body;
    const { name } = req.body;

    const group = await db.collection('groups').findOne({ gid });

    if (group) {

        await db.collection('users').updateOne({ uid }, {
            $addToSet: { groupids: gid },
        })
        await db.collection('groups').updateOne({ gid }, {
            $addToSet: { cantPost: uid },
            $push: { partials: { uid: uid, text: text, date: date, name:name } },
        })
        res.json(group)        

        }
    else
        res.status(404).send('Not found :(')

});

//used by scheduler to post all user contributions as one combined newsletter. creates an identifier and info like group newsletter belongs to, when it was published, etc.
app.put('/api/post-news', async (req, res) => {
    const { gid } = req.body;
    const { groupName } = req.body;
    const { newsletterParts } = req.body;

    const group = await db.collection('groups').findOne({ gid });
    if (group) {
        let nid = (Math.random() + 1).toString(36).substring(5);
        const newCutoff = getCutoff(group.frequency);

        await db.collection('newsletters').insertOne({
            nid: nid,
            group: gid,
            groupName: groupName, 
            newsletter: newsletterParts,
            date: new Date()
        })

        await db.collection('groups').updateOne({ gid }, {
            $push: {newsletters: nid},
            $set: {partials: [], cutoffDate: newCutoff}
        })
        res.json(group)        

        }
    else
        res.status(404).send('Not found :(')

});

//resets "cantpost" array at 10pm est
app.put('/api/dailyreset', async (req, res) => {
    await db.collection('groups').updateMany({}, { $set: { cantPost: [] } });
})




//use this to ensure no duplicates when creating group name
app.get('/api/validate/:type/:id', async (req, res) => {
    const { type } = req.params;
    const { id } = req.params;
    const { uid } = req.user;


    if (type === "group") {
        const group = await db.collection('groups').findOne({ gid });
        if (group) {
            res.status(404).send('Dupe found')
        }
        else
            res.json(group)

    }
    if (type === "user") {
        const user = await db.collection('groups').findOne({ uid });
        if (user) {
            res.status(404).send('Dupe found')
        }
        else
            res.json(user)

    }
})

//lets creator of group change the frequency of the group
app.put('/api/change-freq/:gid', async (req, res) => {
    const { gid } = req.params;
    const { frequency } = req.body;
    var cutoff = getCutoff(frequency);

    const group = await db.collection('groups').findOne({ gid });

    if (group) {
        await db.collection('groups').updateOne({ gid }, {
            $set: { frequency: frequency, cutoffDate:cutoff },
        })
        res.status(200).send()
    }
    else
        res.status(404).send('Not found :(')
})

//makes sure group id, userid, or newsletterid don't already exist in database
app.get('/api/validate/:type/:id', async (req, res) => {
    const { type } = req.params;
    const { id } = req.params;
    const { uid } = req.user;


    if (type === "group") {
        const group = await db.collection('groups').findOne({ gid });
        if (group) {
            res.status(404).send('Dupe found')
        }
        else
            res.json(group)

    }
    if (type === "user") {
        const user = await db.collection('groups').findOne({ uid });
        if (user) {
            res.status(404).send('Dupe found')
        }
        else
            res.json(user)

    }
})

//returns groups that have newsletters that are ready to be delivered. in the form{gid, g_name: partials([{}, {}, ])}
app.get('/api/cutoff', async (req, res) => {
    const pastCutoff = await db.collection('groups').find({ cutoffDate : {$lte: new Date()}});

    if (pastCutoff){
        const groups = await db.collection('groups').find({ cutoffDate : {$lte: new Date()}}, {projection: {_id: 0, partials: 1, gid: 1, name: 1} }).toArray()
        res.json(groups)
    }
    else
        res.status(404).send('Not found :(')

    
})

//deletes user's account
app.put('/api/delete-account', async (req, res) => {
    const { uid } = req.user;

    const user = await db.collection('users').findOne({ uid });
    if (user) {
        for (let gid of user.groupids){
            await db.collection('groups').updateOne({ gid }, {
                $pull: { users: uid },
            })
        }
        await db.collection('users').deleteOne({ uid: uid });

        res.status(200).send()
    }
        
    else
        res.status(404).send('Not found :(')

});

//function to determine the cutoff date of a newsletter. in other words, when the next newsletter is to be posted.
const getCutoff = (frequency) => { 
    var cutoffDate = null;

    if(frequency === "Daily"){
        cutoffDate = addHours(new Date(), 22);
     }
     else if(frequency === "Weekly"){
         cutoffDate = add(new Date(),{days:6, hours:22,});
     }
     else if(frequency === "Biweekly"){
        cutoffDate = add(new Date(),{days:13, hours:22,});
    }
     else if(frequency === "Monthly"){
          const oneMonth = addMonths(new Date(), 1);
          cutoffDate = sub(oneMonth, {hours:2});
     }
     else if(frequency === "Quarterly"){
         const threeMonths = addMonths(new Date(), 3);
         cutoffDate = sub(threeMonths, {hours:2});
     }
     else if(frequency === "Test"){
        cutoffDate = new Date("January 31, 2024 22:35:00")
    }
    return cutoffDate
}

 

connect(() => {
    app.listen(8000, () => {
        console.log('Server is listening on port 8000')
    })
})