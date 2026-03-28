import { MongoClient } from 'mongodb';

// Paschal2
// z9fiZDDPjebMQNt
// mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0

// const uri = process.env.MONGODB_URI;
const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0"

// Reuse connection across warm invocations
let client;
async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('clicker').collection('counter');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const col = await getDb();

  if (req.method === 'GET') {
    const doc = await col.findOne({ _id: 'global' });
    return res.json({ count: doc?.count ?? 0 });
  }

  if (req.method === 'POST') {
    const result = await col.findOneAndUpdate(
      { _id: 'global' },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return res.json({ count: result.count });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
