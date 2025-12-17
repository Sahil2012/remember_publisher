import express from 'express';
import dotenv from 'dotenv';
import revampRoutes from './routes/revamp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api', revampRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
