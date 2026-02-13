import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import morganMiddleware from './middleware/loggerCollector.js';
import { clerkMiddleware } from '@clerk/express';
import errorHandler, { notFoundHandler } from './middleware/errorHandler.js';
import bookRoutes from './routes/bookRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import pageRoutes from './routes/pageRoutes.js';


configDotenv();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(clerkMiddleware({ debug: process.env.NODE_ENV === "development" }));
app.use(express.json());
app.use(morganMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/pages", pageRoutes);

// Serve uploads statically
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
    try {
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.log(error);
    }
});

export default app;
