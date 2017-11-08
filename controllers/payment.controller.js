const CronJob = require('cron').CronJob;

exports.create_savings = function (data) {

};

exports.start_payment_cron = function (until, period) {
    const endDate = new Date(until);
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const day = currentDate.getDay();
    const endTimeInMilliSeconds = endDate.getTime();

    let cronTime;
    let periodInMilliSeconds;
    if (period === "seconds") {
        cronTime = `* * * * * *`;   // check each second
        periodInMilliSeconds = 1000;
    } else {
        cronTime = `0 0 ${hours} * * * ${day}`;
    }

    const job = new CronJob({
        cronTime: '* * * * * *',
        onTick: function() {
            console.log('You will see this message every second');
            const timeNow = new Date().getTime();
            if (endTimeInMilliSeconds < timeNow + periodInMilliSeconds) {
                console.log("Stopppppping");
                // this.stop();
            }
        },
        start: true,
        timeZone: 'America/Los_Angeles'
    });

    job.start();
};
