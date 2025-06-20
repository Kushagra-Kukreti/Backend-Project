import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"



const app = express();

//this is for cross-origin
//.use -- for configuration or for middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


//limit for request and for receiving json format data
app.use(
  express.json({
    limit: "16kb",
  })
);

//for url configurations
app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))

//for storing data in public folder
app.use(express.static("public"))

//for crud operations on cookies
app.use(cookieParser())



//routes declaration 
import userRouter from "./routes/user.routes.js"
import { postRouter } from "./routes/post.routes.js";
import { commentRouter } from "./routes/comment.routes.js";
app.use("/api/v1/users",userRouter)
app.use("/api/v1/user/posts",postRouter)
app.use("/api/v1/user/posts",commentRouter)

export default app;
