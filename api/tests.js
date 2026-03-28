const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0";

let client;
async function getCol() {
  if (!client) { client = new MongoClient(uri); await client.connect(); }
  return client.db('swaptest').collection('users');
}

module.exports = async function handler(req, res) {
  console.log('tests request:', req.method);

  try {
    const col   = await getCol();
    const users = await col.find({ testDate: { $exists: true, $ne: '' } }).toArray();

    // Strip passwords before sending to client
    const safe = users.map(u => ({
      name:        u.name,
      email:       u.email,
      phone:       u.phone,
      testDate:    u.testDate,
      vehicleType: u.vehicleType,
      region:      u.region,
    }));

    console.log('returning', safe.length, 'users');
    return res.json({ users: safe });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
