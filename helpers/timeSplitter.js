

const TimeSplitter = (starttime,endtime)=>{
    const [sttime,stperiod] = starttime.split(" ");
    const [edtime,edperiod] = endtime.split(" ");
    const [sthour,stminute] = sttime.split(":");
    const [edhour,edminute] = edtime.split(":");

    return {
        'starthour': parseInt(sthour,10),
        'startMinute':parseInt(stminute,10),
        'endhour':parseInt(edhour,10),
        'endMinute':parseInt(edminute,10)
    }
}

module.exports = TimeSplitter;