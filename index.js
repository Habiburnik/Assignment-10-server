const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wx3f0no.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db("VisaVista");
    const visaCollection = database.collection("visaDetails");

    const applicationCollection = database.collection("applications");

    // Add a new visa entry


    app.get('/visa/:id', async (req, res) => {
      const id = req.params.id;
      const visa = await visaCollection.findOne({ _id: new ObjectId(id) });
      if (!visa) {
        return res.status(404).send({ message: 'Visa not found' });
      }

      res.send(visa);
    });

    app.get('/applications', async (req, res) => {
      try {
        const userEmail = req.query.email;
        if (!userEmail) {
          return res.status(400).send({ error: 'Email is required' });
        }

        const result = await database
          .collection('applications')
          .find({ email: userEmail })
          .toArray();

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to fetch applications' });
      }
    });

    app.post('/visa', async (req, res) => {
      const visaData = req.body;
      const result = await visaCollection.insertOne(visaData);
      res.send(result);
    });

    app.post('/applications', async (req, res) => {
      const application = req.body;
      const result = await applicationCollection.insertOne(application);
      res.send({ insertedId: result.insertedId });

    });

    app.get('/my-visas', async (req, res) => {
      const email = req.query.email;
      const result = await client.db("VisaVista").collection("visaDetails").find({ addedBy: email }).toArray();
      res.send(result);
    });

    app.get('/visa', async (req, res) => {
      const result = await visaCollection.find().toArray();
      res.send(result);
    });

    app.put('/visa/:id', async (req, res) => {
      const { id } = req.params;
      const updatedVisa = req.body;
        const result = await visaCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedVisa }
        );
        res.send(result);
    });

    // Delete visa by ID
    app.delete('/visa/:id', async (req, res) => {
      const { id } = req.params;
        const result = await visaCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });


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
  res.send('Visa Management server is running')
})

app.listen(port, () => {
  console.log(`server is running on port : ${port}`)
})