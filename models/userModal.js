const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true
    },
    phoneno:{
        type:String,
        unique:true
    },
    password:{
        type:String,
    },
    Address:{
        type:String
    }
});

const user = mongoose.models.users||mongoose.model("users",userSchema);
module.exports = user;