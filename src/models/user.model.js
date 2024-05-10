import mongoose,{ Schema } from "mongoose"

import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"


const UserSchema=new mongoose.Schema({
username:{
 type:String,
 required:true,
 unique:true,
 lowercase:true,
 trim:true,
 index:true
},
email:{
  type:String,
  required:true,
  lowercase:true,
  trim:true,
  index:true
},
fullname:{
  type:String,
  required:true,
  trim:true,
  index:true
},
avatar:{
    type:String,
    required:true
},
coverImage:{
    type:String,
   
},
watchHistory:[
{
  type:Schema.Types.ObjectId,   
  ref:"video"
},
],
password:{
    type:String,
    required:[true, " password is required "]
},
refreshToken:{
    type:String,
}

},{timestamps:true})


UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashed= await bcrypt.hash(this.password, 10);
  this.password=hashed
  next();
});

UserSchema.methods.isPasswordCorrect=async function(password){
 return await bcrypt.compare(password,this.password)
}


UserSchema.methods.generateAccessToken=function (){
 return JWT.sign({
        _id:this.id,
        email:this.email,
        password:this.password,
        fullName:this.fullName,
     },
     process.env.ACCESS_TOKEN_SECRET,
     {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
     })
  
},

UserSchema.methods.refreshtoken=function (){
  return JWT.sign({
    _id:this.id,
  
 },
 process.env.REFRESH_TOKEN_SECRET,
 {
  expiresIn:process.env.REFRESH_TOKEN_EXPIRY
 })
}



export const User=mongoose.model("User",UserSchema)





