const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: any) => console.error('Error connecting to MongoDB:', err));

module.exports = mongoose;