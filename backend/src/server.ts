import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import morganMiddleware from './middleware/loggerCollector.js';
import { clerkMiddleware } from '@clerk/express';


configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(clerkMiddleware({ debug: process.env.NODE_ENV === "development" }));
app.use(cors());
app.use(express.json());
app.use(morganMiddleware);

app.use("/auth", authRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

app.listen(PORT, () => {
    try {
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.log(error);
    }
});

export default app;
