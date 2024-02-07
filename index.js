const express = require('express');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yrcmf.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        // Database collections
        const productsCollection = client.db('zaynax_db').collection('products');
        const promoCodesCollection = client.db('zaynax_db').collection('promocodes');

        // add new products api
        app.post('/products', async (req, res) => {
            const newItem = req.body;
            const result = await productsCollection.insertOne(newItem);
            res.send(result);
        });

        // add new promocodes api
        app.post('/promocodes', async (req, res) => {
            const newItem = req.body;
            newItem.createdAt = new Date();
            const result = await promoCodesCollection.insertOne(newItem);
            res.send(result);
        });

        // get all promocodes from db
        app.get('/promocodes', async (req, res) => {
            const result = await promoCodesCollection.find().toArray();
            res.send(result);
        });

        // get single promocode api
        app.get("/promocode/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await promoCodesCollection.findOne(query);
            res.send(result);
        });

        // update promocode api
        app.patch("/promocode/:id", async (req, res) => {
            const id = req.params.id;
            const updatedPromo = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    ...updatedPromo,
                }
            }
            const result = await promoCodesCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You're successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("✅ Database Successfully Connected!");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
