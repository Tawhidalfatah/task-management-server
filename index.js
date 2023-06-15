// Importing necessary packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Defining Port
const port = process.env.PORT || 5000;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB uri setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4xnjt3a.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // Database Collections
    const taskCollection = client.db("taskManager").collection("tasks");
    const usersCollection = client.db("taskManager").collection("users");

    app.get("/alltasks/:email", async (req, res) => {
      const email = req.params.email;

      console.log(email);

      const query = { email: email };
      const result = await taskCollection.find(query).toArray();

      res.send(result);
    });

    app.put("/updatetask/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          task: body.task,
          description: body.description,
          status: body.status,
          priority: body.priority,
        },
      };
      const options = { upsert: true };
      const result = await taskCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    app.patch("/completetask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "completed",
        },
      };
      const result = await taskCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.delete("/deletetask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/addtask", async (req, res) => {
      const doc = req.body;
      const result = await taskCollection.insertOne(doc);
      res.send(result);
    });

    console.log("Connected to MongoDB.");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ message: "Task Manager Server is running" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
