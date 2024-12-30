import mongoose from "mongoose";
const schema=new mongoose.Schema({
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
})
const product=mongoose.model("product",schema);
export default product;