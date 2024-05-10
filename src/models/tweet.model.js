import mongoose ,{Schema,model}from "mongoose"


  const TweetSchema=new Schema({
 
   content:{
       type:String,//one who is subscribing
       required:true,
   },
   Owner:{
     type:Schema.Types.ObjectId,
     ref:"User"
   } 

  },{timestamps:true})



  const Tweets=mongoose.model("tweet",TweetSchema)


  export { Tweets };