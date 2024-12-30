import mongoose from "mongoose";
const schema=new mongoose.Schema({
    userName:{
        type:String,
    },
    EmailId:{
        type:String
    },
    password:{
        type:String
    },
    Cart:[{
        Name:{
            type:String
        },
        FullName:{
            type:String
        },
        price:{
            type:String
        },
        img:{
            type:String
        }
    }],
    Orders:[{
            type:mongoose.Schema.ObjectId
    }],
    Address: {
        type: String
    },
    mobileNumber:{
        type:String
    }
})
const user=mongoose.model("user",schema);
export default user;