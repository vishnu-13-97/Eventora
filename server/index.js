const express = require("express");
const app = express();
const cors = require('cors');
const { config } = require("dotenv");
config();
const PORT = process.env.PORT || 5000;
const database = require('./config/db');
const authRoutes = require('./routes/auth');

app.use(express.json());
app.use('/api/auth', authRoutes);   




app.use(cors());



app.listen(PORT,()=>{

   try {
    database();
    console.log(`Server is running on port ${PORT}`);
   } catch (error) {
    console.error("Failed to connect to the database:", error);
   }                    
})