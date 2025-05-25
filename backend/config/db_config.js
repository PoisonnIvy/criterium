import mongoose from 'mongoose';

export const connectDB = async () => {
try {
    const conection = await mongoose.connect(process.env.DEV_MONGO_URI, {});

    console.log(`MongoDB connected: ${conection.connection.host}`);
}catch (error) {
    console.log('Error connecting to MongoDB:', error.message);
    process.exit(1); // Termina el proceso si no se puede conectar. 1 es error, 0 es correcto
}  
}