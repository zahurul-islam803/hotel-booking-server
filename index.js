const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2vdoex.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware
const logger = async(req, res, next) => {
  const {token} = req.cookies
  console.log('called', req.host, req.originalUrl);
  next();
}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection


    const roomCollection = client.db('hotelDB').collection('rooms');
    const bookingCollection = client.db('hotelDB').collection('bookings');

    // get all rooms
    app.get('/api/v1/rooms', async(req, res)=>{
      let queryObj = {};
      const price = req.query.price;
      console.log(price)
      if (price) {
        queryObj.price = price;
      }
      const cursor = roomCollection.find(queryObj)
      const result = await cursor.toArray()
      res.send(result);
    })

    // bookings added
    app.post('/api/v1/user/add-booking', async(req, res)=> {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      res.send(result);
    })

    // booking cancel
    app.delete('/api/v1/user/cancel-booking/:bookingId', async(req, res) => {
      const id = req.params.bookingId;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query)
      res.send(result);
    })

    // access token
    app.post('/api/v1/auth/access-token', async(req, res)=> {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20h'})
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false
        })
        .send({ success: true })
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("crud is running...");
});

app.listen(port, (req, res) => {
  console.log(`crud server is running on port: ${port}`);
});
