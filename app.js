const express = require('express');
const app = express();
const { Client } = require('pg');
const generateFakeUsers = require('./generatefakedata');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const client = new Client({
  user: process.env.PG_USER,
  host: 'localhost',
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(express.json()); // Parse JSON bodies

(async () => {
  try {
    await client.connect();
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY,
        name text,
        balance numeric,
        phone text
      );
    `;
    await client.query(createUsersTableQuery);

    const createTradeHistoryTableQuery = `
      CREATE TABLE IF NOT EXISTS trades (
        id serial PRIMARY KEY,
        user_id integer REFERENCES users(id),
        instrument text,
        qty integer,
        price numeric,
        timestamp timestamp
      );
    `;
    await client.query(createTradeHistoryTableQuery);

    console.log('Tables created successfully.');

    const fakeUsers = generateFakeUsers();

    for (const user of fakeUsers) {
      const insertUserQuery = 'INSERT INTO users (name, balance, phone) VALUES ($1, $2, $3) RETURNING id';
      const userResult = await client.query(insertUserQuery, [user.name, user.balance, user.phone]);
      const userId = userResult.rows[0].id;

      // Insert trade history records and associate with the user
      for (const trade of user.tradeHistory) {
        const insertTradeQuery = 'INSERT INTO trades (user_id, instrument, qty, price, timestamp) VALUES ($1, $2, $3, $4, $5)';
        await client.query(insertTradeQuery, [userId, trade.instrument, trade.qty, trade.price, trade.timestamp]);
      }
    }

    console.log('Fake data inserted successfully.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
})();





// Get balance form a userid

app.get('/user/:id/balance', async (req, res) => {
  const userId = req.params.id;
  try {
    const query = 'SELECT balance FROM users WHERE id = $1';
    const result = await client.query(query, [userId]);
    const balance = result.rows[0]?.balance || 0;
    res.json({ balance });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get user id from phone number

app.get('/user/:phone/id', async (req, res) => {
  const userPhone = req.params.phone;
  try {
    const query = 'SELECT id FROM users WHERE phone = $1';
    const result = await client.query(query, [userPhone]);
    const userId = result.rows[0]?.id || null;
    res.json({ userId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get trade history from user id

app.get('/user/:id/trade-history', async (req, res) => {
  const userId = req.params.id;
  try {
    const query = 'SELECT * FROM trades WHERE user_id = $1';
    const result = await client.query(query, [userId]);
    const tradeHistory = result.rows;
    res.json({ tradeHistory });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update balance from user id

app.put('/user/:id/balance', async (req, res) => {
  const userId = req.params.id;
  const newBalance = req.body.balance;
  try {
    const query = 'UPDATE users SET balance = $1 WHERE id = $2';
    await client.query(query, [newBalance, userId]);
    res.json({ message: 'Balance updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
