import mongoose from "mongoose";
const schema=new mongoose.Schema({
    Name:{
        type:String
    },
    EmailId:{
        type:String
    },
    Message:{
        type:String
    }
})
const Review=mongoose.model("Review",schema);
export default Review;