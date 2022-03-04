
   
const { MongoClient } = require('mongodb');
const { BasicStrategy } = require('passport-http');
const passport = require('passport');


const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let collection;
let userCollection;
async function connect() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db('auth');
    collection = db.collection('student');
    userCollection = db.collection('user');
}

connect();

passport.use(new BasicStrategy(
    async (username, password, done) => {
        console.log('username and psword frome postman',username, password)
        const result = await userCollection.findOne({ username });
        if(result && result.password === password){
            return done(null, {user: username});
        } else {
            return done(null, false);
        }
    }
));

const express = require('express');
const Api = express();
Api.use(passport.initialize());
Api.use(express.json());


Api.post('/', passport.authenticate('basic', { session: false }),async (req, res) => {
    req.body.id = new Date().valueOf();
    await collection.insertOne(req.body);
    res.send('added');
});



Api.get('/', async (req, res) => {
        const result = await collection.find({}).toArray();
        res.send(result);
    });


Api.get('/:id', async (req, res) => {
    const id = +req.params.id;
    const result = await collection.find({ id }).toArray();
    res.send(result)
});


Api.delete('/:id', passport.authenticate('basic', { session: false }),async (req, res) => {
    const id = +req.params.id;
    await collection.deleteOne({ id })
    res.send('deleted')
});



Api.put('/:id',passport.authenticate('basic', { session: false }), async (req, res) => {
    const id = +req.params.id;
    await collection.updateOne({ id }, { $set: req.body });
    res.send('hamne kr diya apdate')
});



Api.listen(3000, () => console.log('server is going on'));








