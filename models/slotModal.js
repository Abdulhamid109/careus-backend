const mongoose = require("mongoose");

const SlotModal = new mongoose.Schema({
    guardianId:{
        type:String
    },
    patientId:{
        type:String
    },
    tabletid:{
        type:String
    },
    
});

const Slot = mongoose.models.slots || mongoose.model("slots",SlotModal);
module.exports = Slot