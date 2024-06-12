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
        required:true
    },
    coverImage:{
        type:String //cloudinary url 
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }
     

},{timestamps:true})

//bcrypt used for hashing the passwords -- means only hash when password field changed
//async because hashing takes time 
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (){
   return await bcrypt.compare(password,this.password)
}


//no nned for async here doesnt take much time 
userSchema.methods.generateAccessToken = function (){
       return jwt.sign(
        {  
            _id : this._id,
            email:this.email,     //data
            fullName:this.fullName,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET, //access token secret
        {
            expiry : process.env.ACCESS_TOKEN_EXPIRY
        }
                                  
    )
}
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
     {  
         _id : this._id //data
     },
     process.env.REFRESH_TOKEN_SECRET, //access token secret
     {
         expiry : process.env.REFRESH_TOKEN_EXPIRY
     }
                               
 )
}

export const User = mongoose.model('User',userSchema);