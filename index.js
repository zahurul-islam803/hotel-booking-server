const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2vdoex.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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
