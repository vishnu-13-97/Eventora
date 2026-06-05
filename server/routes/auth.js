const express = require('express');
const router = express.Router();
const User = require('../models/User');

const jwt = require('jsonwebtoken');    
const authController = require('../controllers/authController');
const { authenticateToken } = require('../config/jwt');


router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verify-otp', authController.verifyOtp);
router.get('/profile', authenticateToken ,authController.getUserProfile);

module.exports = router;