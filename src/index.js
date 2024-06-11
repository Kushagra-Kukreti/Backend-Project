import app from "./app.js";
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});
//after DB connection only start listening on the port 
connectDB().then(()=>{
  app.listen(process.env.PORT||8000,()=>{
     console.log("Server is listening on port",process.env.PORT);
  })
}).catch((err)=>{
  console.log("DB connection error",err);
})
