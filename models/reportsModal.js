const mongoose = require("mongoose");

const ReportModal = new mongoose.Schema({
    GuardianId:{
        type:String
    },
    patientId:{
        type:String
    },
    reportName: {
        type: String
    },
    reportPicLink: {
        type: String
    },
    HospitalName: {
        type: String
    }
});

const Report = mongoose.models.reports || mongoose.model('reports',ReportModal);
module.exports = Report;