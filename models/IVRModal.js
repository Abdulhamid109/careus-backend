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
        type:Boolean,
        default:false
    },
    AfternoonCallStatus:{
        type:Boolean,
        default:false
    },
    EveningCallStatus:{
        type:Boolean,
        default:false
    },
    callid:{
        type:String
    },

    Date:{
        type:Date,
    },

});

const IVR = mongoose.models.ivr || mongoose.model('ivr',IVRModal);
module.exports = IVR;