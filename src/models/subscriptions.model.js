import mongoose ,{Schema,model}from "mongoose"


  const SubscriptionSchema=new Schema({
 
   subscriber:{
       type:Schema.Types.ObjectId,//one who is subscribing
       ref:"User"
   },
   channel:{
     type:Schema.Types.ObjectId,
     ref:"User"
   } 

  },{timestamps:true})



  const Subscription=mongoose.model("Subscription",SubscriptionSchema)


  export { Subscription };