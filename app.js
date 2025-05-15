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
const tenderRoute = require('./routes/tender')
const eventRoute = require('./routes/event')
const mediaRoute = require('./routes/media')
const roadmapRoute = require('./routes/roadmap')
const newsletterRoute = require('./routes/newsletter')
const teamRoute = require('./routes/team')
const startupRoute = require('./routes/startup')


connectDatabase()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Express app running!');
  });
app.use('/api/v1', userRoute)
app.use('/api/v1', tenderRoute )
app.use('/api/v1', eventRoute)
app.use('/api/v1', mediaRoute)
app.use('/api/v1', roadmapRoute)
app.use('/api/v1', newsletterRoute)
app.use('/api/v1', teamRoute)
app.use('/api/v1', startupRoute)


app.listen(process.env.PORT, ()=>{
    console.log(`Server listening to Port ${process.env.PORT} in ${process.env.NODE_ENV}`)
});