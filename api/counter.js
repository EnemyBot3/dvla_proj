const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0";

let client;

async function getCol() {
  if (!client) {
    console.log('connecting to mongo...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('connected!');
  }
  return client.db('clicker').collection('counter');
}

module.exports = async function handler(req, res) {
  console.log('request method:', req.method);

  const col = await getCol();

  if (req.method === 'GET') {
    const doc = await col.findOne({ _id: 'global' });
    console.log('doc:', doc);
    return res.json({ count: doc?.count ?? 0 });
  }

  if (req.method === 'POST') {
    const doc = await col.findOneAndUpdate(
      { _id: 'global' },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    console.log('updated doc:', doc);
    return res.json({ count: doc.count });
  }
};
