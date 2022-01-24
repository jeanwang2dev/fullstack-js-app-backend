require("dotenv").config();

// grab the packages we need

const express = require('express');
const mongodb = require('mongodb');
const cors = require('cors');


// configure our app

const app = express();
const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 1337;

app.use(express.json());
app.use(cors());

// app.use(authenticateUser()); middleware

// connect to our mongodb database

let cachedClient = null;
let cachedDB = null;

async function connectToDatabase(){

    if (cachedDB) return cachedDB;

    const client = await MongoClient.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // tls: true,
        // tlsCAFile: "./ca-certificate.crt",
    });

    const db = client.db('mongodbVSCodePlaygroundDB');
    
    cachedClient = client;
    cachedDB = db;

    return db;
}

// create our routes

app.get('/', (req, res) => {
    res.send('Hello World!');
});


// --create

app.post("/tweets", async(req, res) => {

    const text = req.body.text;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const gender = req.body.gender;
    const date = randomDate(new Date(2020, 0, 1), new Date())
    const db = await connectToDatabase();
    const tweet = await db.collection("tweets").insertOne({
        text : text,
        fname: fname,
        lname: lname,
        read : false,
        date : date,
        gender: gender
    });

    res.send({tweet});

});

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// --read

app.get('/tweets', async(req, res) => {

    const db = await connectToDatabase();
    const tweets = await db.collection("tweets").find({}).toArray();

    res.json({tweets });
});

// --read the tweet

app.get('/tweets/:tweetId', async(req, res) => {

    const tweetId = req.params.tweetId;
    const db = await connectToDatabase();
    const  tweet = await db
        .collection("tweets")
        .findOne({ _id: mongodb.ObjectId(tweetId)});

    res.json({ tweet });
});

// --update

app.put("/tweets/:tweetId", async(req, res) => {

    const tweetId = req.params.tweetId;
    const text = req.body.text;
    const date = randomDate(new Date(2020, 0, 1), new Date())
    const db = await connectToDatabase();
    const tweet = await db
        .collection("tweets")
        .updateOne({_id: mongodb.ObjectId(tweetId) }, { $set: { "text":text, "read": false, "date": date},  });

    res.send({tweet});

});

// --delete

app.delete("/tweets/:tweetId", async(req, res) => {

    const tweetId = req.params.tweetId;
    const db = await connectToDatabase();
    const tweet = await db
        .collection("tweets")
        .deleteOne({_id: mongodb.ObjectId(tweetId) });

    res.send({tweet});

});

// create the server

app.listen( port, () => {
    console.log('Our app is running on port', port);
});
