const User = require('../models/User');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/email');
const OTP = require('../models/Otp');

const generateOtp = () => {
   return Math.floor(100000 + Math.random() * 900000).toString();
}


const generateToken = (user) => {
   return jwt.sign(
      {
         id: user._id,
         role: user.role
      },
      process.env.JWT_SECRET,
      {
         expiresIn: '7d'
      }
   );
};


const registerUser = async (req, res) => {
   try {

      const { username, email, password, confirmPassword } = req.body;

      if (!username || !email || !password || !confirmPassword) {
         return res.status(400).json({
            message: 'All fields are required'
         });
      }

      if (password !== confirmPassword) {
         return res.status(400).json({
            message: 'Passwords do not match'
         });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
         return res.status(400).json({
            message: 'Email already in use'
         });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
         username,
         email,
         role: 'user',
         password: hashedPassword,
         isverified: false
      });

      const otp = generateOtp();
      await OTP.create({ email, otp, action: 'account_verification' });
       
     await sendOTPEmail(email, otp, 'account_verification'); 


      res.status(201).json({
         message: "User registered successfully. Please check your email for the OTP to verify your account.",
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role   
      
      });

   } catch (error) {

      res.status(500).json({
         message: 'Server error',
         error: error.message
      });

   }
};







const loginUser = async (req, res) => {
   try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
         return res.status(400).json({
            message: 'Invalid credentials'
         });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.status(400).json({
            message: 'Invalid credentials'
         });
      }
  if(!user.isverified && user.role !== 'admin'){
         const otp = generateOtp();
         await OTP.deleteMany({ email: user.email, action: 'account_verification' });
         await OTP.create({ email: user.email, otp, action: 'account_verification' });
        await sendOTPEmail(user.email, otp, 'account_verification');

         return res.status(403).json({
            message: 'Account not verified. Please check your email for the OTP to verify your account.',
            needsVerification: true
         });
      }  
       const token = generateToken(user);
      res.json({
         message: 'User logged in successfully',
         _id: user._id,
         username: user.username,
         email: user.email,
         role: user.role,
         token: token
      });

   } catch (error) {

      res.status(500).json({
         message: 'Server error',
         error: error.message
      });

   }
};


const verifyOtp = async (req, res) => {
   try {
      const { email, otp } = req.body;

      const otpRecord = await OTP.findOne({
         email,
         otp,
         action: 'account_verification'
      });

      if (!otpRecord) {
         return res.status(400).json({
            message: 'Invalid OTP'
         });
      }

      const user = await User.findOneAndUpdate(
         { email },
         { isverified: true },
         { new: true }
      );

      await OTP.deleteMany({
         email,
         action: 'account_verification'
      });

      const token = generateToken(user);
      res.json({
         message: 'Account verified successfully',
         _id: user._id,
         username: user.username,
         email: user.email,
         role: user.role,
         token
      });

   } catch (error) {
      res.status(500).json({
         message: 'Server error',
         error: error.message
      });
   }
};

const getUserProfile = async (req, res) => {
   try {
      console.log(req.user);
      const user = await User.findById(req.user.id).select('-password');
       console.log('db user:', user);

      if (!user) {
         return res.status(404).json({
            message: 'User not found'
         });
      }

      res.json({
         _id: user._id,
         username: user.username,
         email: user.email,
         role: user.role
      });

   } catch (error) {
      res.status(500).json({
         message: 'Server error',
         error: error.message
      });
   }
};


module.exports = {
    registerUser,
    loginUser,
      verifyOtp,
      getUserProfile
}       
    
