//here we will be storing defining the schema configurations for IVR Mechanism
const mongoose = require("mongoose");


const IVRModal = new mongoose.Schema({
    guardianId:{
        type:String
    },
    patientId:{
        type:String
    },
    tabletId:{
        type:String
    },
    PatientPhoneNo:{
        type:String
    },
    MorningCallStatus:{
        type:Boolean
    },
    AfternoonCallStatus:{
        type:Boolean
    },
    EveningCallStatus:{
        type:Boolean
    },
    callid:{
        type:String
    },

    Date:{
        type:Date,
        unique:true
    },

});

const IVR = mongoose.models.ivr || mongoose.model('ivr',IVRModal);
module.exports = IVR;