const mongoose = require("mongoose");

const TabletModal = new mongoose.Schema({
    guardianId: {
        type: String
    },
    patientId: {
        type: String
    },
    illnessType: {
        type: String
    },
    tabletName: {
        type: String
    },
    tabletFrequencey: {
        //dinn mein kitte bar leni hai
        type: String
    },
    //kitte din ki dava hai
    CourseDuration: {
        type: String
    },
    MorningSlot:{
        SlotSelected:Boolean,
        SlotStartTime:String,
        SlotEndTime:String,
        ScheduleRunning:{
            type:Boolean,
            default:false,
        },
    },
    AfternoonSlot:{
        SlotSelected:Boolean,
        SlotStartTime:String,
        SlotEndTime:String,
        ScheduleRunning:{
            type:Boolean,
            default:false,
        },
    },
    EveningSlot:{
        SlotSelected:Boolean,
        SlotStartTime:String,
        SlotEndTime:String,
        ScheduleRunning:{
            type:Boolean,
            default:false,
        },
    }


});

const Tablet = mongoose.models.Tablets || mongoose.model("Tablets", TabletModal);
module.exports = Tablet;