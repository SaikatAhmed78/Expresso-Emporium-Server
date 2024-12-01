const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1bvy3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const usersCollection = client.db('coffeeDB').collection('users');


    app.get('/coffee', async(req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray()

      res.send(result);
    });

    app.get('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await coffeeCollection.findOne(query)

      res.send(result);
    });


    app.post('/coffee', async(req, res) => {
        const newCoffee = req.body;
        console.log(newCoffee)

        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result)
    });

    app.put('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const options = {upsert : true};
      const updatedCoffee = req.body;

      const coffee = {
        $set: {
          name: updatedCoffee.updatedName,
          updatedChef: updatedCoffee.updatedChef,
          updatedSupplier: updatedCoffee.updatedSupplier,
          updatedTaste: updatedCoffee.updatedTaste,
          updatedCategory: updatedCoffee.updatedCategory,
          updatedDetails: updatedCoffee.updatedDetails,
          updatedPhoto: updatedCoffee.updatedPhoto,

        }
      }

      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result)
    });
    

    
    app.delete('/coffee/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await coffeeCollection.deleteOne(query);
        res.send(result)
    });

    // Users Releted API
    app.post('/users', async(req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);

    });

    app.get('/users', async(req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    });

    app.patch('/users', async(req, res) => {
      const email = req.body.email;
      const filter = {email};

      const updateDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime
        }
      }
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result)
    })

    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Expresso Project Start')
})

app.listen(port , () => {
    console.log(`Coffee Server is Running on Port: ${port}`)
})