const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

const jwt = require('jsonwebtoken');

const opts = {
    secretOrKey: 'top_secret',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};


passport.use(new Strategy(opts, async function (payload, done) {
    const result = await userCollection.findOne({ username: payload.username });
    if(!result){
        return done(null, false);
    } else {
        return done(null, true);
    }
}));

const Api = express();
Api.use(express.json());
const port = 3000;

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let userCollection;
let collection;
async function connect() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db('auth');
    userCollection = db.collection('user');
    collection = db.collection('student');
}; 

connect();

Api.post('/login', async (req, res) => { 
    const { username, password } = req.body; 
    const result = await userCollection.findOne({ username });
    if(!result) {
        res.status(401).send('Unauthorized');
    } else if(result && result.password === password) {
        const token = jwt.sign({ username }, 'top_secret', { expiresIn: 1000 * 60 * 60});
        res.send(token);
    }
});

Api.post('/', passport.authenticate('jwt', { session: false }),async (req, res) => {
    await collection.insertOne(req.body)
    res.send('added')
});


Api.get('/',passport.authenticate('jwt', { session: false }), async(req, res) => {
    const output = await collection.find({}).toArray();
    res.send(output);
});


Api.get('/:id',passport.authenticate('jwt', { session: false }),async (req, res) => {
    const id = req.params.id;
    const output = await collection.findOne({_id: new ObjectId(id)})
    console.log(output);
    res.send(output);
});



Api.delete('/:id',passport.authenticate('jwt', { session: false }), async(req, res) => {
 const id = req.params.id;
 const output = await collection.deleteOne({_id: new ObjectId(id)});
res.send('deleted');
});


Api.put('/:id',passport.authenticate('jwt', { session: false }), async(req, res) => {
    const id = req.params.id;
    const result = await collection.updateOne({_id: new ObjectId(id)},{ $set: req.body } )
    res.send('updated')
});


Api.listen(3000, () => console.log('server is going on'));


