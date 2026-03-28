const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0";

let client;
async function getDb() {
  if (!client) { client = new MongoClient(uri); await client.connect(); }
  return client.db('swaptest');
}

module.exports = async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email required' });

  try {
    const db       = await getDb();
    const messages = db.collection('messages');
    const users    = db.collection('users');

    // Find all messages involving this user
    const all = await messages.find({
      $or: [{ fromEmail: email }, { toEmail: email }]
    }).sort({ createdAt: -1 }).toArray();

    // Group by the OTHER person, keep only the latest message per conversation
    const seen = {};
    all.forEach(m => {
      const otherEmail = m.fromEmail === email ? m.toEmail : m.fromEmail;
      if (!seen[otherEmail]) {
        seen[otherEmail] = {
          otherEmail,
          lastMessage: m.text,
          lastAt:      m.createdAt,
        };
      }
    });

    // Look up names and test dates for each other user
    const otherEmails = Object.keys(seen);
    const otherUsers  = await users.find({ email: { $in: otherEmails } }).toArray();
    otherUsers.forEach(u => {
      if (seen[u.email]) {
        seen[u.email].otherName     = u.name;
        seen[u.email].otherTestDate = u.testDate;
      }
    });

    const conversations = Object.values(seen).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    console.log('returning', conversations.length, 'conversations for', email);
    return res.json({ conversations });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
