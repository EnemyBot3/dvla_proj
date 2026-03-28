const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Paschal2:z9fiZDDPjebMQNt@cluster0.zcp9tl1.mongodb.net/?appName=Cluster0";

let client;
async function getCol() {
  if (!client) { client = new MongoClient(uri); await client.connect(); }
  return client.db('swaptest').collection('users');
}

module.exports = async function handler(req, res) {
  console.log('auth request:', req.method);
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  try {
    const col  = await getCol();
    const body = req.body;
    console.log('action:', body.action);

    if (body.action === 'register') {
      const existing = await col.findOne({ email: body.email });
      if (existing) return res.status(400).json({ error: 'email already registered' });

      const user = {
        name:        body.name,
        email:       body.email,
        password:    body.password,
        phone:       body.phone || '',
        dvlaNumber:  body.dvlaNumber,
        testDate:    body.testDate,
        vehicleType: body.vehicleType,
        region:      body.region,
      };
      await col.insertOne(user);
      console.log('registered:', user.email);
      return res.json({ user });
    }

    if (body.action === 'login') {
      const user = await col.findOne({ email: body.email, password: body.password });
      if (!user) return res.status(401).json({ error: 'invalid email or password' });
      console.log('logged in:', user.email);
      return res.json({ user });
    }

    return res.status(400).json({ error: 'unknown action' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
