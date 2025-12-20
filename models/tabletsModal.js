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

    SlotType:{
        type:String,
        enum:["morning","afternoon","evening"]
    },
    // if the user selects the morning slot then it should consider the time span as 6:00am to 12:00pm
    SlotStartTime:{
        time:{
            type:String
        },
    },
    SlotEndTime:{
        type:String
    },


});

const Tablet = mongoose.models.Tablets || mongoose.model("Tablets", TabletModal);
module.exports = Tablet;