const express = require('express');
const { MongoClient } = require('mongodb');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

var opts = {
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
async function connect() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db('auth');
    userCollection = db.collection('user');
}

connect();

Api.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await userCollection.findOne({ username });
    if(!result) {
        res.status(401).send('Unauthorized');
    } else if(result && result.password === password) {
        const token = jwt.sign({ username }, 'top_secret', { expiresIn: 1000000});
        res.send(token);
    }
});

Api.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const body = req.body
    res.send('khushboo')
});

Api.listen(3000, () => console.log('serve is going on'));
