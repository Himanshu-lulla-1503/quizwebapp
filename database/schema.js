const mongoose= require('mongoose');
const loginschema=new mongoose.Schema({
    Username:String,
    Password:String
},{versionKey:false });
const login = new mongoose.model("login",loginschema);
module.export=login;