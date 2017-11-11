const CronJob = require('cron').CronJob;
const neo = require('neo-api-js');
const Neon = require('neon-js');

const config = require('../config');
const NodeService = require("../services/node");

/**
 * Create new savings in smart contract.
 * @param deadline - end time for saving in unixtime
 * @param name - name/purpose for saving
 */
exports.open_savings = function (deadline, name) {
    const name = Neon.u.str2hexstring(name);
    const scriptHash = Neon.wallet.getScriptHashFromAddress(config.contractAddress);
    // Build script
    const sb = Neon.sc.default.create.scriptBuilder();
    sb.emitAppCall(scriptHash, "create", [deadline, name]);

    // Test the script with invokescript
    Neon.rpc.Query.invokeScript(sb.str).execute(NodeService.getNode());

    // Create InvocationTransaction for real execution
    const account = Neon.getAccountFromWIFKey(config.wif);
    const tx = Neon.sc.default.create.invocationTx(account.publicKey, {}, {}, sb.str, 0);
    console.log(tx);
};

exports.start_payment_cron = function (until, period) {
    /*
     Should use pollingPolicy?
     const pollingPolicy = neo.service.createPollingPolicy(interval);
     pollingPolicy.onInterval(function () {
     });*/

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
