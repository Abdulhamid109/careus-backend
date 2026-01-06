const express = require("express");
const user = require("../models/userModal");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connect = require("../Config/dbconfig");
const patient = require("../models/patientModal");
const Tablet = require("../models/tabletsModal");
const ImageKit = require("imagekit");
const Report = require("../models/reportsModal");
const Slot = require("../models/slotModal");
const cron = require("node-cron");
const twilio = require("twilio");
const TimeSplitter = require("../helpers/timeSplitter");
const IVR = require("../models/IVRModal");

var imagekit = new ImageKit({
    publicKey: "public_bIVsnVmys/a5fZiFVHIfljPyGDs=",
    privateKey: "private_9WWojQ+nJhqyiFbSudmN36951W4=",
    urlEndpoint: "https://ik.imagekit.io/abdulhamid109"
});
connect();


const demofunction = (count) => {
    console.log("Our Cron is getting executed inside the REST based GET Request =>" + count)
}

let task = null; //demo cron job
let morningTask = null;
let afternoonTask = null;
let eveningTask = null;
router.get("/", (req, res) => {
    var count = 0;
    task = cron.schedule('* * * * * *', () => {
        count += 1;
        demofunction(count);
        if (count == 10) {
            console.log("Cron Job stopped on 10th execution");
            task.stop();
        }
    });
    res.send("This is the Home Page URL Calling from Backend");
});




router.post("/auth/signup", async (req, res) => {
    try {
        const { name, email, phoneno, password } = req.body;
        if (!name || !email || !phoneno || !password) {
            console.log("Field empty...");
            res.status(404).json({ error: "Missing values" });
        }
        const db = await user.findOne({ email });
        if (db) {
            console.log("Account already exists");
            res.status(404).json({ error: "Account already exists....Signup" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newuser = new user({
            name,
            email,
            phoneno,
            password: hashedPassword
        });

        const saveduser = await newuser.save();

        return res.status(200).json(
            { success: true, message: "Successfully account created" },
        )

    } catch (error) {
        res.status(500).json(
            { error: "Error => " + error }
        )
    }
});


router.post("/auth/login", async (req, res) => {
    try {
        const { phoneno } = req.body;
        if (!phoneno) {
            return res.status(404).json(
                { error: "Kindly enter the phone no" }
            )
        }
        const db = await user.findOne({ phoneno });
        if (!db) {
            console.log("Account not found...signup");
            return res.status(404).json(
                { error: "Account not found...signup" }
            )
        }

        const payloadData = {
            email: db.email,
            uid: db._id,
        }

        const token = jwt.sign(payloadData, process.env.SECRET_KEY, { expiresIn: "1d" });
        return res.status(200).json(
            { success: true, message: "Successfully logged in", token }
        );

    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            { error: "Internal Server error" + error },
        )
    }
});


router.post("/profile", async (req, res) => {
    try {
        const { token } = await req.body;
        if (!token) {
            return res.status(401).json(
                { error: "Unauthorized user" },
            )
        }
        const data = jwt.verify(token, process.env.SECRET_KEY,);

        const uidd = data.uid;
        console.log("UID" + uidd);
        const userdb = await user.findById(uidd);
        console.log("User=>" + userdb);
        return res.status(200).json(
            { success: true, message: "successfully fetched the user", user: userdb }
        )
    } catch (error) {
        console.log("Internal Server error =>" + error);
        return res.status(500).json(
            { error: "Internal server error => " + error }
        )
    }
});

router.post("/updateprofile/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email, phoneno, address } = req.body;
        if (!id) {
            console.log("Unauthorized user");
            res.status(401).json(
                { error: "Unauthorized user" }
            )
        }

        const userdb = await user.findByIdAndUpdate(id, {
            name, email, phoneno, address
        });

        return res.status(200).json(
            { success: true, message: "Successfully updated the data", user: userdb }
        );



    } catch (error) {
        console.log("Internal server error " + error);
        return res.status(500).json(
            { error: "Internal server error" + error }
        )
    }
});

router.post("/addpatientData", async (req, res) => {
    try {
        const { guardianId, patientName, patientAge, patientGender, phoneNumber, Address } = await req.body;
        const newpatient = await patient.create({
            guardianId,
            patientName,
            patientAge,
            patientGender,
            phoneNumber,
            Address
        });


        return res.status(200).json(
            {
                success: true,
                message: "Successfully updated the patients details",
                patient: newpatient
            }
        )
    } catch (error) {
        console.log("Internal server error" + error);
        return res.status(500).json(
            { error: "Internal Server error " + error },
        )
    }
});

//need to update the values based on the modified schema
router.post("/addtablets", async (req, res) => {
    try {
        // Log the incoming request body for debugging
        console.log("Request Body:", req.body);

        // Destructure the request body
        const {
            guardianId,
            patientId,
            illnessType,
            tabletName,
            tabletFrequencey,
            CourseDuration,
            MorningSlot,
            AfternoonSlot,
            EveningSlot,
        } = req.body;

        // Log the destructured values for debugging
        console.log("MorningSlot:", MorningSlot);
        console.log("AfternoonSlot:", AfternoonSlot);
        console.log("EveningSlot:", EveningSlot);

        const newtablets = new Tablet({
            guardianId,
            patientId,
            illnessType,
            tabletName,
            tabletFrequencey,
            CourseDuration,
            MorningSlot: {
                SlotSelected: MorningSlot.SlotSelected,
                SlotStartTime: MorningSlot.SlotStartTime,
                SlotEndTime: MorningSlot.SlotEndTime,
            },
            AfternoonSlot: {
                SlotSelected: AfternoonSlot.SlotSelected,
                SlotStartTime: AfternoonSlot.SlotStartTime,
                SlotEndTime: AfternoonSlot.SlotEndTime,
            },
            EveningSlot: {
                SlotSelected: EveningSlot.SlotSelected,
                SlotStartTime: EveningSlot.SlotStartTime,
                SlotEndTime: EveningSlot.SlotEndTime,
            },
        });

        const savedTablet = await newtablets.save();
        console.log("New Tablet Record:", savedTablet);

        const now = new Date();
        console.log("My Date => " + now.toLocaleDateString('en-IN'))


        // TODO:IVR schema needs to be created from here needs to be scheduled from here
        // The Schedular should be stopped after 30 days from now...
        const patientdb = await patient.findById(patientId);
        const pN = await patientdb["phoneNumber"];
        console.log(pN);

        // const newIvr = new IVR({
        //     guardianId,
        //     patientId,
        //     tabletId: savedTablet._id,
        //     PatientPhoneNo: pN,
        //     Date: now.toLocaleString('en-IN')
        // });

        // const savedIVR = await newIvr.save();



        console.log("timer started for =>" + CourseDuration + " days");
        // setTimeout(() => {
        //     console.log("Finally time completed stopping the schdular");
        //     task.stop();

        //     return res.status(200).json({
        //         success: true,
        //         message: "Successfully completed the course duration..hence stoping the task",

        //     })
        // }, parseInt(CourseDuration) * 24 * 60 * 60 * 1000);





        return res.status(200).json({
            success: true,
            message: "Successfully added the tablets and created the instance of IVR",
            tablets: savedTablet,
            // IVR: savedIVR
        });
    } catch (error) {
        console.log("Internal Server Error:", error);
        return res.status(500).json({ error: "Internal Server Error: " + error });
    }
});


router.post("/addreports", async (req, res) => {
    try {
        const file = req.body;

        const response = await imagekit.upload({
            file,
            fileName: req.query.reportName,
            folder: '/careus-reports'
        });

        const newreport = new Report({
            GuardianId: req.query.GuardianId,
            patientId: req.query.patientId,
            reportName: req.query.reportName,
            reportPicLink: response.url,
            HospitalName: req.query.HospitalName,
        });

        const savedreport = await newreport.save();
        console.log("New Report Record" + savedreport);
        return res.status(200).json(
            {
                success: true,
                message: "Successfully added the report",
                reports: savedreport
            }
        )

    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            { error: "Internal Server error" + error }
        )
    }
});

router.post('/addslot', async (req, res) => {
    try {
        const { guardianId, patientId, SlotType, SlotStartTime, SlotEndTime } = await req.body;
        const newSlot = new Slot({
            guardianId,
            patientId,
            SlotType,
            SlotStartTime,
            SlotEndTime
        });
        const saveSlot = await Slot.save();
        console.log("Successfully saved the slot " + saveSlot);
        return res.status(200).json(
            {
                success: true,
                message: "Successfully added the slot",
                slot: saveSlot
            }
        );
    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            { error: "Internal server error" + error }
        )
    }
});


router.get('/getallpatients/:id', async (req, res) => {
    try {
        const uid = req.params.id;
        if (!uid) {
            res.status(401).json(
                { error: "Un-authorized user" }
            )
        }
        const userdb = await patient.find({ guardianId: uid });
        if (!userdb) {
            res.status(403).json(
                { error: "No Patients Found" }
            )
        }
        return res.status(200).json(
            {
                "success": true,
                "message": "Successfully fetched all the information",
                "Patients": userdb
            }
        )

    } catch (error) {
        res.status(500).json(
            { error: "Internal Server error =>" + error }
        )
    }
});

router.delete('/deletePatient/:pid', async (req, res) => {
    try {
        const p_uid = req.params.pid;
        if (!p_uid) {
            res.status(401).json(
                {
                    error: "No Patient id found"
                }
            )
        }
        const deletePatient = await patient.findByIdAndDelete(p_uid);
        return res.status(200).json(
            {
                "success": true,
                "message": "Successfully deleted the object",
                deletePatient
            }
        )
    } catch (error) {
        res.status(500).json(
            { error: "Internal Server error" + error }
        )
    }
});

//getting a single patient data
router.get('/getPatientPersonalData/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const patientdb = await patient.findById(pid);
        if (!patientdb) {
            console.log("No Data found");
            res.status(401).json(
                { error: "Unauthorized user" }
            )
        }

        return res.status(200).json({
            success: true,
            message: "Successfully fetched the patient data",
            patient: patientdb
        });
    } catch (error) {
        console.log("Internal Server error " + error);
        res.status(500).json(
            { error: "Internal Server error" + error }
        )
    }
});

router.get('/getPatientTablet/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        if (!pid) {
            return res.status(401).json(
                { error: "Un-authorized User" }
            )
        }
        const patientdb = await Tablet.find({ patientId: pid });
        if (!patientdb) {
            console.log("Patient is not Present in the record");
            return res.status(404).json(
                { error: "Patient Tablets data not found" }
            )
        }
        return res.status(200).json(
            {
                success: true,
                "message": "Successfully fetched the data",
                patients: patientdb
            }
        )

    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            { error: "Internal Server error" + error }
        )
    }
});

router.put('/updateMedicalhistory/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        if (!pid) {
            console.log("Unauthorized User");
            res.status(401).json(
                { error: "Un-authorized user" }
            )
        }
        const { illnessType, tabletName, tabletFrequencey, CourseDuration, MorningSlot, AfternoonSlot, EveningSlot } = req.body;
        console.log(illnessType);
        console.log(tabletName);
        console.log(tabletFrequencey);
        console.log(CourseDuration);
        console.log("--------Slot Information--------")

        console.log(MorningSlot.SlotSelected);
        console.log(MorningSlot.SlotStartTime);
        console.log(MorningSlot.SlotEndTime);


        const updateMedicalTabletData = await Tablet.findOneAndUpdate(
            {
                patientId: pid
            },
            {
                illnessType,
                tabletName,
                tabletFrequencey,
                CourseDuration,
                MorningSlot: {
                    SlotSelected: MorningSlot.SlotSelected,
                    SlotStartTime: MorningSlot.SlotStartTime,
                    SlotEndTime: MorningSlot.SlotEndTime
                },
                AfternoonSlot: {
                    SlotSelected: AfternoonSlot.SlotSelected,
                    SlotStartTime: AfternoonSlot.SlotStartTime,
                    SlotEndTime: AfternoonSlot.SlotEndTime
                },
                EveningSlot: {
                    SlotSelected: EveningSlot.SlotSelected,
                    SlotStartTime: EveningSlot.SlotStartTime,
                    SlotEndTime: EveningSlot.SlotEndTime
                }
            }
        );

        res.status(200).json(
            {
                success: true,
                message: "Successfully updated the medical history",
                data: updateMedicalTabletData
            }
        )
    } catch (error) {
        console.log("Internal server error " + error);
        res.status(500).json(
            {
                error: "Internal Server error" + error
            }
        )
    }
});


router.get("/tabletInfo/:id", async (req, res) => {
    try {
        // just for rememberance=>
        // after the user enters the tablet info then start the cron job 
        const id = req.params.id;
        if (!id) {
            return res.status(401).json(
                { error: "Unauhtorized" }
            )
        }
        const tabletdb = await Tablet.findById(id);
        if (!tabletdb) {
            console.log("No Tablet Info found");
            return res.status(404).json(
                { error: "No tabs (something went wrong)" }
            )
        }
        return res.status(200).json(
            {
                success: true,
                message: "Successfully fetched the tablet data",
                tablet: tabletdb
            }
        )
    } catch (error) {
        console.log("Internal Server error");
        res.status(500).json(
            { error: "Internal server error" + error }
        )
    }
});

// creating an twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
router.post('/ivr/voice', (req, res) => {
    try {

        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say({
            voice: 'alice',
            language: 'en-IN',
        }, "Welcome to Careus organization! Press 1 if you took medicine , Press 2 if you didn't, Press 3 if you wanna make a call to you guardian ")

        const gather = twiml.gather({
            numDigits: 1,
            action: '/api/ivr/gather',
            method: "POST",
            timeout: 5
        });


        gather.say("Please Press a number");
        twiml.redirect('/ivr/voice');
        res.type('text/xml');
        res.send(twiml.toString());

    } catch (error) {
        console.log("Internal Server error" + error);
        res.status(500).json(
            { error: "Internal Server errror" + error }
        );
    }
});

router.post('/ivr/gather', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    console.log("Body" + JSON.stringify(req.body));
    const digits = req.body.Digits;

    if (!digits) {
        twiml.say(
            { voice: 'alice', language: 'en-IN' },
            'Sorry, I did not receive any input. Please try again.'
        );
        twiml.redirect('/api/ivr/voice');
    } else {
        switch (digits) {
            case '1':
                //function to update the status of the call in the database
                // need to check which section call is comming
                // tookMed(1);
                twiml.say("Thank You for taking the medicine");
                twiml.hangup();
                break;
            case '2':
                //function to update the status of the call in the database
                twiml.say("Please contact you guardian if you have any inconsistancy..");
                twiml.hangup();
                break;
            case '3':
                //function to update the status of the call in the database
                twiml.say("We will be shorly connecting your call to your guardian ..for demo hunging the call");
                twiml.hangup();
                break;
            default:
                twiml.say('Invalid option. Please try again.');

        }
    }


    twiml.redirect('/ivr/voice');
    res.type('text/xml');
    res.send(twiml.toString());
});



router.post('/ivr/makecall', async (req, res) => {
    try {
        const { phoneNumber, MorningSlot, AfternoonSlot, EveningSlot, pid, tabletid, guardianId } = await req.body;
        console.log("Somethign" + MorningSlot);
        const IsMorningSlot = MorningSlot.SlotSelected;
        const IsAfternoonSlot = AfternoonSlot.SlotSelected;
        const IsEveningSlot = EveningSlot.SlotSelected;
        const MorningSlotStartTime = MorningSlot.SlotStartTime;
        const MorningSlotEndTime = MorningSlot.SlotEndTime;
        const AfternoonSlotStartTime = AfternoonSlot.SlotStartTime;
        const AfternoonSlotEndTime = AfternoonSlot.SlotEndTime;
        const EveningSlotStartTime = EveningSlot.SlotStartTime;
        const EveningSlotEndTime = EveningSlot.SlotEndTime;
        var SlotType = '';

        if (IsMorningSlot) {
            const { starthour, startMinute, endhour, endMinute } = TimeSplitter(MorningSlotStartTime, MorningSlotEndTime);
            console.log(starthour);
            console.log(endhour);
            console.log(startMinute);
            console.log(endMinute);
            SlotType = "Morning";

            //lets find the difference between the starttime and endtime (consider only hours)
            const callno = (endhour - starthour) / 2;
            console.log("call no time " + callno);
            const callathour = starthour + callno;
            console.log("Scheduling hour => " + callathour); //decomal time
            const hr = Math.floor(callathour);
            const min = Math.floor((callathour - hr) * 60);

            //update the scheudling status
            const tabdb = await Tablet.findOneAndUpdate({ _id: tabletid }, { MorningScheduleRunning: true });


            morningTask = cron.schedule(`${min} ${hr} * * *`, async () => {
                // schedular need to be done on this...
                console.log("started")
                const call = await client.calls.create({
                    url: "https://217b052016b2.ngrok-free.app/api/ivr/voice",
                    to: "+919860573041",
                    from: process.env.TWILIO_PHONE_NUMBER,
                    statusCallback: `https://217b052016b2.ngrok-free.app/api/ivr/call-status/${tabletid}/${SlotType}/${pid}/${guardianId}`,
                    statusCallbackMethod: "POST",
                    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]
                },
                    {
                        timezone: 'Asia/Kolkata'
                    });

                res.status(200).json({
                    success: true,
                    message: "Successfully compelted the call",
                    callid: call.sid,
                });
            });
        }
        //same for afternoon slot and same for evening slot

        if (IsAfternoonSlot) {
            const { starthour, startMinute, endhour, endMinute } = TimeSplitter(AfternoonSlotStartTime, AfternoonSlotEndTime);
            const callno = (endhour - starthour) / 2;
            console.log("call no time " + callno);
            const callathour = starthour + callno;
            console.log("Scheduling hour => " + callathour); //decomal time
            const hr = Math.floor(callathour);
            const min = Math.floor((callathour - hr) * 60);
            //update the scheudling status
            const tabdb = await Tablet.findOneAndUpdate({ _id: tabletid }, { AfternoonScheduleRunning: true });


            afternoonTask = cron.schedule(`${min} ${hr + 12} * * *`, async () => {
                // schedular need to be done on this...
                const call = await client.calls.create({
                    url: "https://d57e2f4019b7.ngrok-free.app/api/ivr/voice",
                    to: "+919860573041",
                    from: process.env.TWILIO_PHONE_NUMBER,
                    statusCallback: `https://217b052016b2.ngrok-free.app/api/ivr/call-status/${tabletid}/${SlotType}/${pid}/${guardianId}`,
                    statusCallbackMethod: "POST",
                    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]

                }, {
                    timezone: 'Asia/Kolkata'
                });

                res.status(200).json({
                    success: true,
                    message: "Successfully compelted the call",
                    callid: call.sid
                });
            });
        }

        if (IsEveningSlot) {
            const { starthour, startMinute, endhour, endMinute } = TimeSplitter(EveningSlotStartTime, EveningSlotEndTime);
            const callno = (endhour - starthour) / 2;
            console.log("call no time " + callno);
            const callathour = starthour + callno;
            console.log("Scheduling hour => " + callathour); //decomal time
            const hr = Math.floor(callathour);
            const min = Math.floor((callathour - hr) * 60);
            //update the scheudling status
            const tabdb = await Tablet.findOneAndUpdate({ _id: tabletid }, { EveningScheduleRunning: true });


            eveningTask = cron.schedule(`${min} ${hr + 12} * * *`, async () => {
                // schedular need to be done on this...
                const call = await client.calls.create({
                    url: "https://d57e2f4019b7.ngrok-free.app/api/ivr/voice",
                    to: "+919860573041",
                    from: process.env.TWILIO_PHONE_NUMBER,
                    statusCallback: `https://217b052016b2.ngrok-free.app/api/ivr/call-status/${tabletid}/${SlotType}/${pid}/${guardianId}`,
                    statusCallbackMethod: "POST",
                    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"]

                }, {
                    timezone: 'Asia/Kolkata'
                });

                res.status(200).json({
                    success: true,
                    message: "Successfully compelted the call",
                    callid: call.sid
                });
            });
        }


        res.status(200).json({
            success: true,
            // MorningSlot
            message: "Schedular started...."
            // callSid: call.sid
        });
    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            { error: "Internal Server error" + error }
        )
    }
})

router.post('/ivr/call-status/:tabletid/:slottype/:pid/:gid', async (req, res) => {
    try {
        const sid = req.body.CallSid;
        const callStatus = req.body.CallStatus;
        const to = req.body.To;
        const from = req.body.From;
        const tabid = req.params.tabletid;
        const slotType = req.params.slottype;
        const patientId = req.params.pid;
        const guardianId = req.params.gid;

        console.log("Call id => " + sid);
        console.log("Call Status => " + callStatus);
        console.log("To => " + to)
        console.log("From => " + from)
        console.log("Tablet id => " + tabid)
        console.log("Patient Id => " + patientId);

        const patientdb = await patient.findById(patientId);
        const name = await patientdb["patientName"];
        const guardiandb = await user.findById(guardianId);
        const phoneno = await guardiandb["phoneno"];

        switch (callStatus) {
            case "ringing":
                console.log(`Call is ringing for user ${to} in Abdul Hamid Patel's workspace.`);
                break;
            case "answered":
                console.log(`Call answered by user ${to} in Abdul Hamid Patel's workspace.`);
                break;
            case "completed":
                if (slotType === "Morning") {
                    //reduce the value of course duration by one
                    const tabletdb = await Tablet.findById(tabid);
                    const duration = await tabletdb["CourseDuration"];
                    const tabdb = await Tablet.findOneAndUpdate({_id:tabid},{CourseDuration:parseInt(duration)-1});
                    
                    if(parseInt(tabdb["CourseDuration"])==0){
                        //send an alert message of tablets been finised
                        await client.messages.create({
                            body:"Alert :Tablets finised!!.. i.e course duration expired!!",
                            from:process.env.TWILIO_PHONE_NUMBER,
                            // to: `+91${phoneno}`
                            to:"+919860573041"

                        });

                        return res.status(404).json({
                            error:"Course duration expired!!"
                        })
                    }

                    //create an new schema with same tablet id for nextdate
                    const now = new Date();
                    const newivr = new IVR({
                        guardianId,
                        patientId,
                        tabletId: tabid,
                        PatientPhoneNo: to,
                        MorningCallStatus: true,
                        callid: sid,
                        Date: now.toLocaleDateString('en-IN') //small issue make sure you make the time instance from date to zero....
                    });

                    const savedivr = await newivr.save();

                    return res.status(200).json(
                        { success: true, message: "Successfully created the ivr data based on the users answer", ivr: savedivr }
                    );
                } else if (slotType === "Afternoon") {
                    //reduce the value of course duration by one
                    const tabletdb = await Tablet.findById(tabid);
                    const duration = await tabletdb["CourseDuration"];
                    const tabdb = await Tablet.findOneAndUpdate({_id:tabid},{CourseDuration:parseInt(duration)-1});
                    
                    if(parseInt(tabdb["CourseDuration"])==0){
                        //send an alert message of tablets been finised
                        await client.messages.create({
                            body:"Alert :Tablets finised!!.. i.e course duration expired!!",
                            from:process.env.TWILIO_PHONE_NUMBER,
                            // to: `+91${phoneno}`
                            to:"+919860573041"

                        });

                        return res.status(404).json({
                            error:"Course duration expired!!"
                        })
                    }
                    const now = new Date();
                    const newivr = new IVR({
                        guardianId,
                        patientId,
                        tabletId: tabid,
                        PatientPhoneNo: to,
                        MorningCallStatus: true,
                        callid: sid,
                        Date: now.toLocaleDateString('en-IN') //small issue make sure you make the time instance from date to zero....
                    });

                    const savedivr = await newivr.save();

                    return res.status(200).json(
                        { success: true, message: "Successfully created the ivr data based on the users answer", ivr: savedivr }
                    );

                } else if (slotType === "Evening") {
                    //reduce the value of course duration by one
                    const tabletdb = await Tablet.findById(tabid);
                    const duration = await tabletdb["CourseDuration"];
                    const tabdb = await Tablet.findOneAndUpdate({_id:tabid},{CourseDuration:parseInt(duration)-1});
                    
                    if(parseInt(tabdb["CourseDuration"])==0){
                        //send an alert message of tablets been finised
                        await client.messages.create({
                            body:"Alert :Tablets finised!!.. i.e course duration expired!!",
                            from:process.env.TWILIO_PHONE_NUMBER,
                            // to: `+91${phoneno}`
                            to:"+919860573041"

                        });

                        return res.status(404).json({
                            error:"Course duration expired!!"
                        })
                    }
                    const now = new Date();
                    const newivr = new IVR({
                        guardianId,
                        patientId,
                        tabletId: tabid,
                        PatientPhoneNo: to,
                        MorningCallStatus: true,
                        callid: sid,
                        Date: now.toLocaleDateString('en-IN') //small issue make sure you make the time instance from date to zero....
                    });

                    const savedivr = await newivr.save();

                    return res.status(200).json(
                        { success: true, message: "Successfully created the ivr data based on the users answer", ivr: savedivr }
                    );

                }
                console.log(`Call completed for user ${to} in Abdul Hamid Patel's workspace.`);
                break;
            case "no-answer":
                console.log(`Call not picked up by user ${to} in Abdul Hamid Patel's workspace.`);

                await client.messages.create({
                    body: `Alert : Call Missed by the ${name}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    // to: `+91${phoneno}` //this phonenumber should be of guardian...(done)
                    to: to
                });
                break;
            case "busy":
                console.log(`Call rejected (busy) by user ${to} in Abdul Hamid Patel's workspace.`);
                break;
            case "failed":
                console.log(`Call failed for user ${to} in Abdul Hamid Patel's workspace.`);
                await client.messages.create({
                    body: `Alert : Call Missed by the ${name}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    // to: `+91${phoneno}` //this phonenumber should be of guardian...(done)
                    to: to
                });
                break;
            case "canceled":
                console.log(`Call canceled for user ${to} in Abdul Hamid Patel's workspace.`);
                await client.messages.create({
                    body: `Alert : Call Missed by the ${name}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    // to: `+91${phoneno}` //this phonenumber should be of guardian...(done)
                    to: to
                });
                break;
            default:
                console.log(`Unknown call status: ${callStatus} for user ${to} in Abdul Hamid Patel's workspace.`);
        }

        return res.status(200).json({ success: true })

    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            {
                error: "Internal Server error" + error
            }
        )
    }
})

// need to focus on duration that after the duration is over the cronjob for particular tablet is should stop
// and the user should have the permission to chnage the duration and based on that modify the cron job
// once the duration is over the guardian should recive an alert for particular tablet.

router.put("/morningjobstop/:tabid", async (req, res) => {
    try {
        const tabId = req.params.tabid;
        if (!tabId) {
            console.log("No tablet id found");
            return res.status(401).json({
                error: "No tablet id found!!"
            });
        }


        morningTask.stop(); //stopped the morning task
        const tabdb = await Tablet.findByIdAndUpdate(tabId, { MorningScheduleRunning: false });
        return res.status(200).json(
            {
                success: true,
                message: "Morning Job Stopped",
                tabletdetails: tabdb
            }
        );

    } catch (e) {
        return res.status(500).json(
            {
                error: "Internal Server error " + e
            }
        )
    }
});

//re-start the stopped schedule
router.put("/morningjobstart/:tabid/:gid", async (req, res) => {
    try {
        const tabId = req.params.tabid;
        const gId = req.params.gid;
        if (!tabId) {
            console.log("No tablet id found");
            return res.status(401).json({
                error: "No tablet id found!!"
            });
        }
        //before starting the same schedule again we need to check the duration..


        const tabletdb = await Tablet.findOne({_id:tabId});
        const duration = await tabletdb["CourseDuration"];

        const guardiandb = await user.findOne({_id:gId});
        const phoneNumber = await guardiandb["phoneno"];

        if(parseInt(duration)!=0){
            morningTask.start(); //here we have started the schdule again
        const tabdb = await Tablet.findByIdAndUpdate(tabId, { MorningScheduleRunning: true });
        return res.status(200).json(
            {
                success: true,
                message: "Morning Job Stopped",
                tabletdetails: tabdb
            }
        );
        }
        await client.messages.create({
            body:"Alert : Course duration expired update the duration!",
            from:process.env.TWILIO_PHONE_NUMBER,
            // to:`+91${phoneNumber}`
            to:"+919860573041"
        });

        return res.status(200).json(
            {
                message:"alert message already transfered to the guardians account"
            }
        )
        

    } catch (error) {
        console.log("Internal Server error" + error);
        return res.status(500).json(
            { error: "Internal Server error " + error }
        )
    }
});

router.put("/afternoonjobstop/:tabid/:gid",async (req,res)=>{
    try {
         const tabId = req.params.tabid;
        if (!tabId) {
            console.log("No tablet id found");
            return res.status(401).json({
                error: "No tablet id found!!"
            });
        }


        morningTask.stop(); //stopped the morning task
        const tabdb = await Tablet.findByIdAndUpdate(tabId, { MorningScheduleRunning: false });
        return res.status(200).json(
            {
                success: true,
                message: "Morning Job Stopped",
                tabletdetails: tabdb
            }
        );
    } catch (error) {
        console.log("Internal Server error"+error);
        return res.status(500).json(
            {error:"Internal Server errror"+error}
        )
    }
});

router.put("/afternoonjobstart/:tabid/:gid",async(req,res)=>{
    try {
        
    } catch (error) {
        console.log("Internal Server error"+error);
        return res.status(500).json(
            {error:"Internal Server error"+error}
        )
    }
})





module.exports = router;