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

// connect to our mongodb database

let cachedClient = null;
let cachedDB = null;

async function connectToDatabase(){

    if (cachedDB) return cachedDB;

    const client = await MongoClient.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        tls: true,
        tlsCAFile: "./ca-certificate.crt",
    });

    const db = client.db('twitter');
    
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
    const db = await connectToDatabase();
    const tweet = await db.collection("tweets").insertOne({text});

    res.send({tweet});

});

// --read

app.get('/tweets', async(req, res) => {

    const db = await connectToDatabase();
    const tweets = await db.collection("tweets").find({}).toArray();

    res.json({tweets });
});

// --update

app.put("/tweets/:tweetId", async(req, res) => {

    const tweetId = req.params.tweetId;
    const text = req.body.text;
    const db = await connectToDatabase();
    const tweet = await db
        .collection("tweets")
        .updateOne({_id: mongodb.ObjectId(tweetId) }, { $set: {text} });

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
