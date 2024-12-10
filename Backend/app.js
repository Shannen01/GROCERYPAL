const express = require('express');
const app = express();
const cors = require('cors');
const listsRouter = require('./routes/lists');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/lists', listsRouter); 

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
}); 