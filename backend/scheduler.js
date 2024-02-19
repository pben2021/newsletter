import { userid, apiKey } from './config.js';
import schedule from 'node-schedule';
import fetch from 'node-fetch';
import admin from 'firebase-admin';

//checks which newsletters are ready to be posted everyday at 10pm


//assembles parts of the newsletter in an easy -to-understand format for front end to assemble.
function assembleNewsletter(group) {
    const groupByUser = group.partials.reduce((acc, item) => {
        const { uid, text, name, date} = item;
        if (!acc[uid]) {
            acc[uid] = [name];
        }

        acc[uid].push({text, date});
        
        return acc;
    }, {});
    return groupByUser
}

//check for groups that have newsletters that are ready to be assembled
async function getGroups(token) {
    const headers = { 'Content-Type': 'application/json', 'authtoken': token }
    const response = await fetch('http://127.0.0.1:8000/api/cutoff', {
        headers: headers,
    });
    if (response.ok) {
        const data = await response.json()     
        for (let group of data) {
            const newsletter = assembleNewsletter(group)
            const res = await fetch('http://127.0.0.1:8000/api/post-news', {
                method: "PUT",
                headers: headers,
                body: JSON.stringify({ gid: group.gid, groupName: group.name, newsletterParts: newsletter, })
            });

        }
    }

}

//function to reset user restrictions
async function resetCantPostArr(token) {
    const headers = { 'Content-Type': 'application/json', 'authtoken': token }
    fetch('http://127.0.0.1:8000/api/dailyreset', {
        method: "PUT",
        headers: headers,
    });
}

//makes sure that everyday at 10pm, these tasks are done
function scheduler() { 
    schedule.scheduleJob('0 22 * * *', async () => {
        const uid = userid
        const customToken = await admin.auth().createCustomToken(uid)

        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json',}, 
            body: JSON.stringify({ token: customToken, returnSecureToken: true }),
        })

        if (res.ok){
            const data = await res.json()
            const token = data.idToken
            resetCantPostArr(token)
            getGroups(token)
        }
        else {
            console.error('Error:',res.status, res.statusText);
        }

    })
}

export default scheduler;




