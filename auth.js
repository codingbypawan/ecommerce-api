const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const router = express.Router();
const JWT_SECRET_KEY = 'my_secret_key';

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, userType } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'Bad Request',
        message: 'User already exists' 
        });
    } 
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      userType
    });
    const user = await newUser.save();
    res.status(201).json({ 
        status: 'success', 
        message: 'User Registered Successfully',
        user: user
     });     
  } catch (error) {
    res.status(500).json({ status: 'Internal Server Error', message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ status: 'Bad Request', message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ status: 'Bad Request', message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user._id, userType: user.userType, name: user.name, email: user.email },
        JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ 
        status: 'success', 
        message: 'Login Successful', 
        token: token 
    });
  } catch (error) {
    res.status(500).json({ status: 'Internal Server Error', message: error.message });
  }
});

module.exports = router;