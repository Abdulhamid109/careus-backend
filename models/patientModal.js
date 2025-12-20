const mongoose = require("mongoose");

const PatientModal = new mongoose.Schema({
    guardianId: {
        type: String,
    },
    patientName: {
        type: String
    },
    patientAge: {
        type: String
    },
    patientGender: {
        type: String,
        enum: ["male", "female"]
    },
    phoneNumber:{
        type:String,
    },
    Address:{
        type:String
    }

});

const patient = mongoose.models.patients || mongoose.model('patient', PatientModal);
module.exports = patient;