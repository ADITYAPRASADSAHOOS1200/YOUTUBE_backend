import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";



const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("Public"))
app.use(express.json({limit:"16kb"}))
app.use(cookieParser())


//routes import 
import Commentsrouter from "./routes/Comments.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users",userRouter)
app.use("/api/v1/comments", Commentsrouter)

export { app }