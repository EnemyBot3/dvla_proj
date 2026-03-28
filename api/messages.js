const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0";

let client;
async function getCol() {
  if (!client) { client = new MongoClient(uri); await client.connect(); }
  return client.db('swaptest').collection('messages');
}

module.exports = async function handler(req, res) {
  console.log('messages request:', req.method);

  try {
    const col = await getCol();

    if (req.method === 'GET') {
      const { from, to } = req.query;
      console.log('fetching messages between', from, 'and', to);

      // Get messages in both directions between these two users
      const messages = await col.find({
        $or: [
          { fromEmail: from, toEmail: to },
          { fromEmail: to,   toEmail: from },
        ]
      }).sort({ createdAt: 1 }).toArray();

      console.log('found', messages.length, 'messages');
      return res.json({ messages });
    }

    if (req.method === 'POST') {
      const { fromEmail, toEmail, text } = req.body;
      const message = { fromEmail, toEmail, text, createdAt: new Date() };
      await col.insertOne(message);
      console.log('message saved from', fromEmail, 'to', toEmail);
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
