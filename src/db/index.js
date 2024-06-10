import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    console.log("Connection string is",`${process.env.MONGO_DB_URI}/${DB_NAME}`)
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log("Connected to the database:HOST", connectionInstance.connection.host);
  } catch (error) {
    console.log("Error occured while connecting to Database", error);
    process.exit(1)
  }
};
