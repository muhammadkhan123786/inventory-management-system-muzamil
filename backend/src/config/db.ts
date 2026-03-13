import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://mongo:27017/humber";
        await mongoose.connect(mongoURI as string);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error', error);
        process.exit(1);
    }
};
