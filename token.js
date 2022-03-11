
var { Strategy, ExtractJwt } = require('passport-jwt')
const passport = require('passport');
const jwt = require('jsonwebtoken');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const client = new MongoClient(url);

let collection;
let itemCollection
async function connect() {
    await client.connect();
    console.log('connected');
    const db = client.db('auth');
    collection = db.collection('fruits');
    itemCollection = db.collection('item');
};
connect();



const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret'
}

passport.use(new Strategy(opts, async function (payload, done) {
    const result = itemCollection.findOne({ username: payload.username });
    if (!result) {
        return done(null, false)
    } else {
        return done(null, true)
    }
}));

']'
const express = require('express');
const Api = express();
Api.use(express.json());
const localhost = 3000;

Api.post('/singin', async(req, res) => {
    const { username, password } = req.body;
    const result = await itemCollection.findOne({username});
    console.log(result)
    if (!result) {
        res.status(404).send('Unautherize')
    } else if (result && result.password === password) {
        const token = jwt.sign({ username }, 'secret', { expiresIn: 86400 });
        res.send(token)
    }
}); 


Api.post('/',( passport.authenticate('jwt', { session: false }), async(req, res) => {
    req.body.id = 'id' + (new Date()).getTime();
   await collection.insertOne(req.body)
    res.send('insurted');
}));

Api.get('/', passport.authenticate('jwt', { session: false }),async(req, res) => {
     const result = await collection.find({}).toArray();
    res.send(result);
});


Api.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.params.id;
    const result = await collection.find({ id }).toArray();
    res.send(result)
});



Api.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.params.id;
    await collection.updateOne({id}, { $set : req.body})
    res.send('updated')
});


Api.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.params.id;
    await collection.deleteOne({id});
    res.send('deleted');
});

Api.listen(3000, () => console.log('server running'));  