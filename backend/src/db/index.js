import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';

mongoose.set('strictQuery', false);

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.mongodb_url}/${DB_NAME}`);
    console.log(`MongoDB connected to ${DB_NAME}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export default connectDb;