import mongoose from "mongoose";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 3000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in your .env file");
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
      return;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      console.warn(
        `MongoDB connection attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS / 1000}s...`
      );
      await wait(RETRY_DELAY_MS);
    }
  }
}