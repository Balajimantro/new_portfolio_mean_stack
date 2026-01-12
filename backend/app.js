const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDb } = require('./mongoDb');
const getAllPortfolioRouter = require('./router/getAllData.router');
const saveContactUsDataRouter = require('./router/saveContactUsData.router');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());

// connecting db
connectDb();

app.use('/api/portfolio', getAllPortfolioRouter);
app.use('/api/contact', saveContactUsDataRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
})