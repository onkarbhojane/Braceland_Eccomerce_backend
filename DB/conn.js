import mongoose from "mongoose";
const conn= async(dbname)=>{
    try{
        const res=await mongoose.connect(`mongodb+srv://${process.env.ID}:${process.env.PASS}@cluster0.rdojecr.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=Cluster0`);
        if(res){
            console.log("connected to DB")
        }else{
            console.log("connection failed ");
        }
    }catch(error){
        console.log("connection error....",error)
    }
}

export default conn;