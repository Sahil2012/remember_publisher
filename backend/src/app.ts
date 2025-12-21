import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import revampRoutes from './routes/revamp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', revampRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
