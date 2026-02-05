const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { connectDb } = require('./mongoDb');
const getAllPortfolioRouter = require('./router/getAllData.router');
const saveContactUsDataRouter = require('./router/saveContactUsData.router');
const adminRouter = require('./router/admin.router');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // connecting db
        await connectDb();

        app.use('/api/portfolio', getAllPortfolioRouter);
        app.use('/api/contact', saveContactUsDataRouter);
        app.use('/api/admin', adminRouter);
        app.get('/health', (req, res) => {
            res.json({ status: 'ok', time: new Date().toISOString() });
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server due to DB connection error.');
        process.exit(1);
    }
}

startServer();
