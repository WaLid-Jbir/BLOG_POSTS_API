import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected ✅', mongoose.connection.host);
    } catch (error) {
        console.log("❌ MongoDB error", error);
        process.exit(1);
    }
};