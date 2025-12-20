const mongoose = require("mongoose");

const connect = async(req,res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const connection = mongoose.connection;
        connection.on("connection",()=>{
            console.log("Successfully connected to Mongodb");
        });
        connection.on("error",(error)=>{
            console.log("Failed to establish the connection with db"+error);
            process.exit(1);
        });
        
    } catch (error) {
        return res.status(500).json(
            {error:"Internal Server error"+error},
        )
    }
}

module.exports = connect;