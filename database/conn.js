const mongoose = require('mongoose');
const connection = async()=>{
    try{
        const status = await mongoose.connect(process.env.MYDB,{ useNewUrlParser: true,useUnifiedTopology: true });
        console.log('connected');

    }catch(err){
        console.log(err);
    }

}
connection();
const signupschema=new mongoose.Schema({
    Username:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    Phoneno:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    },
    Repassword:{
        type:String,
        required:true
    }
},{
    timestamps:true

},{versionKey:false });
const signup = new mongoose.model("signup",signupschema);
module.exports=signup
