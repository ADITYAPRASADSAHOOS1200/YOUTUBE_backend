import mongoose from "mongoose";
// import { DB_Name } from "../constants.js";



const connectDb = async (url) => {
    try{
      const connectionInstance= await mongoose.connect(url)
      console.log(`\n MongoDb connectes!!Db HOst: ${connectionInstance.connection.host}`);
    }catch(err){
        console.log("MongoDb is connection err",err);
        process.exit(1);
    }

}

export default connectDb