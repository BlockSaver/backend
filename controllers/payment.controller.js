const CronJob = require('cron').CronJob;

exports.create_savings = function (data) {

};

exports.start_payment_cron = function (endDate, period) {
    const job = new CronJob({
        cronTime: '* * * * * *',
        onTick: function() {
            console.log('You will see this message every second');
        },
        start: true,
        timeZone: 'America/Los_Angeles'
    });

    job.start();
};
