const express =  require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connect } = require("./Config/dbconfig");
dotenv.config()
const app = express();
const apiRoutes = require("./routes/apiroutes");
connect;

app.use(cors({origin:"*"}));
app.use(express.json())
app.use(express.raw({type:'multipart/form-data',limit:"10mb"}))
app.use("/api",apiRoutes);




const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("Server started on PORT 3000");
})
