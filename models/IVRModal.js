//here we will be storing defining the schema configurations for IVR Mechanism
const mongoose = require("mongoose");


const IVRModal = new mongoose.Schema({
    guardianId: {
        type: String
    },
    patientId: {
        type: String
    },
    tabletId: {
        type: String
    },
    PatientPhoneNo: {
        type: String
    },
    MorningSlot: {
        SlotType: {
            type: String,
            default: "Morning"
        },
        MorningCallStatus: {
            type: Boolean,
            default: false
        },
        callid: {
            type: String
        },
    },
    AfternoonSlot: {
        SlotType: {
            type: String,
            default: "Afternoon"
        },
        AfternoonCallStatus: {
            type: Boolean,
            default: false
        },
        callid: {
            type: String
        },
    },


    EveningSlot: {
        SlotType: {
            type: String,
            default: "Evening"
        },
        EveningCallStatus: {
            type: Boolean,
            default: false
        },
        callid: {
            type: String
        },
    },

    Date: {
        type: String,
    },

});

const IVR = mongoose.models.ivr || mongoose.model('ivr', IVRModal);
module.exports = IVR;