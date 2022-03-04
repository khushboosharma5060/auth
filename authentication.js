var { MongoClient, Collection } = require('mongodb');
var url = "mongodb://localhost:27017/";
const passport = require('passport');
const { BasicStrategy } = require('passport-http');


let collection;
let userCollection;
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("auth")
  collection = dbo.collection('student')
  userCollection = dbo.collection('user')

  console.log('connected');
});

const express = require('express');
const Api = express();
Api.use(express.json());
const localhost = 3000;

passport.use(new BasicStrategy(
   async function (userid, password, done) {
    const result = await userCollection.findOne({username: userid});
    if(!result){
      done(null, false);
    }else {
      if(result.password === password){
        done(null, true); 
      }
    }

  }));



Api.post('/', async (req, res) => {
  req.body.id = new Date().valueOf();
  await collection.insertOne(req.body);
  res.send('added')
});



Api.get('/', passport.authenticate('basic', { session: false }),async (req, res) => {
  const result = await collection.find({}).toArray();
  res.send(result);
});



Api.get('/:id', async (req, res) => {
  const id = +req.params.id
  const result = await collection.find({id : id}).toArray();
  res.send(result);
});



Api.put('/:id', async (req, res) => {
  const id = +req.params.id
  var newvalues = { $set: req.body };
  await collection.updateOne({ id }, newvalues)
  res.send('updatad')
})



Api.delete('/:id', async (req, res) => {
  const id = +req.params.id;
  await collection.deleteOne({ id })
  res.send('deleted')
});



Api.listen(3000, () => console.log('serve is going on'));


