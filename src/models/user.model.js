import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true //for making it searchable
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
    },
    avatar:{
        type:String, //cloudinary url
        required:false
    },
    coverImage:{
        type:String //cloudinary url 
    },
    posts:[{
         type:Schema.Types.ObjectId,
        ref:"Post"
    },
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    followers:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    following:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }]
     

},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect = async function(password){
    console.log("this.password",this.password);
    
  return bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = async function(){
     return jwt.sign({
        _id:this.id,
        email:this.email
        
     },process.env.ACCESS_TOKEN_SECRET)
}
userSchema.methods.generateRefreshToken = async function(){
     return jwt.sign({ _id:this.id},process.env.REFRESH_TOKEN_SECRET)
}

export const User = mongoose.model("User",userSchema)
 