import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
dotenv.config();

import { connectDB } from './config/db.js';
import authRouter from './routes/auth.route.js';
import postsRouter from './routes/posts.route.js';

const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

// Server listening
app.listen(process.env.PORT, async () => {
    await connectDB();
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});