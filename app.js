const express = require('express');
const app = express();
const dotenv = require('dotenv')
require("dotenv").config();
const path = require('path')
const connectDatabase = require('./config/connectDatabase')
const cors = require("cors");
const { json } = require('stream/consumers');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  console.log(`📦 Payload size: ${contentLength ? contentLength + ' bytes' : 'unknown'}`);
  next();
});


dotenv.config({path: path.join(__dirname, 'config', 'config.env')})

const userRoute = require('./routes/user')
const tenderRoute = require('./routes/tender')
const eventRoute = require('./routes/event')
const mediaRoute = require('./routes/media')
const roadmapRoute = require('./routes/roadmap')
const newsletterRoute = require('./routes/newsletter')
const teamRoute = require('./routes/team')
const startupRoute = require('./routes/startup')
const partnerRoute = require('./routes/partner')
const carouselImage = require('./routes/carouselImage')
const message = require('./routes/message')
const ecosystemRoute = require('./routes/ecosystem')
const internshipRoute = require('./routes/internship')
const projectRoute = require('./routes/project')
const stockDetailRoute = require('./routes/stockDetail');
const updateStockRecordsRoute = require('./routes/updateStockRecords');
const eventRecordRoute = require('./routes/eventRecord');
const contactRoute = require('./routes/contact');

connectDatabase()
//app.use(express.urlencoded({ extended: true }));

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
app.use('/api/v1/partners', partnerRoute)
app.use('/api/v1', carouselImage)
app.use('/api/v1', message)
app.use('/api/v1', ecosystemRoute)
app.use('/api/v1', internshipRoute)
app.use('/api/v1', projectRoute)
app.use('/api/v1', stockDetailRoute)
app.use('/api/v1', updateStockRecordsRoute);
app.use('/api/v1/events', eventRecordRoute);
app.use('/api/v1', contactRoute);


app.listen(process.env.PORT, ()=>{
    console.log(`Server listening to Port ${process.env.PORT} in ${process.env.NODE_ENV}`)
});