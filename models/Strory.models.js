import mongoose from "mongoose";
const schema=new mongoose.Schema({
    src:{
        type:String
    }
})
const Story=mongoose.model("Story",schema);
export default Story;