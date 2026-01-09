const express = require('express');

const connectDB = require('./db');
const authRoutes = require('./auth');
const productRoutes = require('./product');
const orderRoutes = require('./order');

const app = express();
connectDB();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.get('/health', (req, res) => {
  res.send('Server is running');
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});