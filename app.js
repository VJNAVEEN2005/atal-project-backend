const express = require('express');
const app = express();
const dotenv = require('dotenv')
const path = require('path')
const connectDatabase = require('./config/connectDatabase')
const cors = require("cors");
const { json } = require('stream/consumers');
app.use(cors());

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})

const userRoute = require('./routes/user')


connectDatabase()

app.use(express.json())

app.use('/api/v1', userRoute)




app.listen(process.env.PORT, ()=>{
    console.log(`Server listening to Port ${process.env.PORT} in ${process.env.NODE_ENV}`)
});