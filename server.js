require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const User = require('./models/userModel');

const app = express();
const port = process.env.PORT || 3000; // Use environment port or 3000

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI).then(() => {
  console.log('MongoDB connected successfully');
  createDefaultAdmin();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Function to create a default admin
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ email: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      const admin = new User({
        name: 'admin',
        email: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Default admin user created.');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
}

app.get('/', (req, res) => {
  res.send('Hello from the TuckshopKonnect backend!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/transactions', transactionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
