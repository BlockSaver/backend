const CronJob = require('cron').CronJob;
const neo = require('neo-api-js');
const Neon = require('neon-js');

const config = require('../config');
const NodeService = require("../services/node");

exports.open_savings = function (amount) {
    const account = Neon.getAccountFromWIFKey(config.wif);
    const scriptHash = Neon.getScriptHashFromAddress(config.contractAddress);
    const invoke = { operation: 'create', scriptHash };
    const intents = [{ assetId: Neon.ASSETS['NEO'], value: amount, scriptHash }];
    const gasCost = 0.5;
    let signedTx;
    console.log("HERE");
    NodeService.getBalance(config.contractAddress).then((response) => {
        // const balance = response.result.balance;
        console.log("Balance is:", response);
        const unsignedTx = Neon.create.invocation(account.publicKey, response, intents, invoke, gasCost, { version: 1 });
        signedTx = Neon.signTransaction(unsignedTx, account.privateKey);
        const hexTx = Neon.serializeTransaction(signedTx);
        return Neon.queryRPC(net, 'sendrawtransaction', [hexTx], 4);
    }).catch(function(error) {
        console.log(error);
    }).then((res) => {
        if (res.result === true) {
            res.txid = Neon.getTransactionHash(signedTx)
        }
        return res
    })
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
