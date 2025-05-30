import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
dotenv.config();
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Server listening
app.listen(process.env.PORT, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});