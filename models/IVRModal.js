//here we will be storing defining the schema configurations for IVR Mechanism
const mongoose = require("mongoose");


const IVRModal = new mongoose.Schema({
    guardianId:{
        type:String
    },
    tabletId:{
        type:String
    },
    PatientPhoneNo:{
        type:String
    },
    CallStatus:{
        type:Boolean
    }
});

const IVR = await mongoose.models.ivr || mongoose.model('ivr',IVRModal);
module.exports = IVR;