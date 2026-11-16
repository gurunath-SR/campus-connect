import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const configuredUri = process.env.MONGO_URI?.trim();

  if (configuredUri) {
    try {
      const conn = await mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(
        'Could not connect to configured MONGO_URI. Falling back to local MongoMemoryServer for runtime execution.'
      );
    }
  }

  memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri();
  const conn = await mongoose.connect(memoryUri);
  console.log(`MongoDB (In-Memory Instance) Connected: ${conn.connection.host}`);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
