const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwosaps.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const userCollection = client.db("dp-TouristGuideDB").collection("users");
        const serviceCollection = client.db("dp-TouristGuideDB").collection("service");
        const reviewsCollection = client.db("dp-TouristGuideDB").collection("reviews");
        const bookedServiceCollection = client.db("dp-TouristGuideDB").collection("bookedService");


        // for user 
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.delete('/users/:id',   async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // for service 
        app.get('/service', async (req, res) => {
            const result = await serviceCollection.find().toArray();
            res.send(result)
        });

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result)
        });

        //   booked collection 
        app.get('/booked', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await bookedServiceCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/booked', async (req, res) => {
            const bookItem = req.body;
            const result = await bookedServiceCollection.insertOne(bookItem);
            res.send(result);
        });
        app.delete('/booked/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookedServiceCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('DP - Tourist Guide project is sitting')
})
app.listen(port, () => {
    console.log(`DP-Tourist Guide project is running on port  : ${port}`)
})
