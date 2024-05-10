import express from "express"
import "dotenv/config"
import connectDb from "./db/index.js"
import { app } from "./app.js"
// import { DB_Name } from "./constants.js"

const PORT=process.env.PORT || 7000;

connectDb(`${process.env.MONGODB_URI}`).then(()=>{
  
app.listen(PORT,()=>console.log(`server is connected at http://localhost:${PORT}`))

}).catch((err)=>{
  
    console.log("Mongo Db connection Failed !!!",err);
})