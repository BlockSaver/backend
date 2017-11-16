/**
 * Create new savings in smart contract.
 * @param deadline - ending date for saving in unixtime
 * @param name - name/purpose for saving
 */
const CronJob = require('cron').CronJob;
const neo = require('neo-api-js');
const Neon = require('neon-js');

const config = require('../config');
const node = require("../services/blockchain");
const exchange = require("../services/exchange.js");
const closeSavings = require("./../services/savings");
const util = require('../util');

function sendNEOToSmartContract(savingsAddress, savingsName, amount) {
    const account = Neon.getAccountFromWIFKey(config.wif);
    const name = util.str2hex(savingsName);
    const address = util.str2hex(savingsAddress);
    const args = [address, name];
    const invoke = { operation: 'addFunds', scriptHash: config.scriptHash, args};
    const intents = [
        { assetId: util.ASSETS['NEO'], value: amount, scriptHash: config.scriptHash }
    ];
    const gasCost = 1;

    node.executeTransaction(account, invoke, gasCost, intents);
}

function makePayment(address, name, amount) {
    exchange.calculateAmountOfNEO(amount).then(NEOAmount => {
        console.log("NEO amount to be sent:", NEOAmount);
        sendNEOToSmartContract(address, name, NEOAmount);
    });
}

/**
 * Start cronjob to run every `time` minutes.
 * We use minutes just for development purposes.
 * @param savings Savings object
 */
exports.startPaymentCronjob = function (savings) {
    /*
     Should use pollingPolicy?
     const pollingPolicy = neo.service.createPollingPolicy(interval);
     pollingPolicy.onInterval(function () {
     });*/
    const address = savings.getAddress();
    const name = savings.getName();
    const amount = savings.getAmount();
    const interval = savings.getInterval();
    const endTime = new Date(savings.getEndTime());
    const cronTime = `*/${interval} * * * *`;

    const job = new CronJob({
        cronTime,
        onTick: function() {
            const currentTime = new Date();
            if (currentTime >= endTime) {
                // Savings finished.
                // End cron job and update smart contract.
                this.stop();
                closeSavings();
            } else {
                // Time for payment
                makePayment(address, name, amount);
            }
        },
        start: true,
    });

    job.start();
};
