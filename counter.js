const { MongoClient } = require('mongodb');

console.log('[startup] handler module loaded');
console.log('[startup] MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('[startup] MONGODB_URI prefix:', process.env.MONGODB_URI?.slice(0, 20));

const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0"

let client;
async function getCol() {
  if (!client) {
    console.log('[db] creating new MongoClient');
    client = new MongoClient(uri);
    console.log('[db] connecting...');
    await client.connect();
    console.log('[db] connected successfully');
  } else {
    console.log('[db] reusing existing client');
  }
  return client.db('clicker').collection('counter');
}

module.exports = async function handler(req, res) {
  console.log('[handler] request received:', req.method);
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    console.log('[handler] getting collection...');
    const col = await getCol();
    console.log('[handler] got collection');

    if (req.method === 'GET') {
      console.log('[handler] running findOne...');
      const doc = await col.findOne({ _id: 'global' });
      console.log('[handler] findOne result:', doc);
      return res.json({ count: doc?.count ?? 0 });
    }

    if (req.method === 'POST') {
      console.log('[handler] running findOneAndUpdate...');
      const doc = await col.findOneAndUpdate(
        { _id: 'global' },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      console.log('[handler] findOneAndUpdate result:', doc);
      return res.json({ count: doc.count });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[handler] ERROR name:', err.name);
    console.error('[handler] ERROR message:', err.message);
    console.error('[handler] ERROR stack:', err.stack);
    res.status(500).json({ error: err.message, name: err.name });
  }
};