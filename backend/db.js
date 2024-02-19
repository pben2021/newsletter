import { MongoClient } from 'mongodb';
let db;

async function connect(cb){
    const client = new MongoClient('mongodb+srv://blue142:tester103@cluster0.rxz6bjq.mongodb.net/?retryWrites=true&w=majority')
    await client.connect();
    db = client.db('friendnews');
    cb();
}
export {db, connect}