const { MongoClient } = require('mongodb');

// const uri = process.env.MONGODB_URI;
const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0"

let client;
async function getCol() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('clicker').collection('counter');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const col = await getCol();

    if (req.method === 'GET') {
      const doc = await col.findOne({ _id: 'global' });
      return res.json({ count: doc?.count ?? 0 });
    }

    if (req.method === 'POST') {
      // MongoDB driver v6: returns the document directly, not result.value
      const doc = await col.findOneAndUpdate(
        { _id: 'global' },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      return res.json({ count: doc.count });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};