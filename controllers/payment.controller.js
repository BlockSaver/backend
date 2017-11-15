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

// TODO: Move open savings to client
exports.open_savings = function (duration, savingsName) {
    const name = util.str2hex(savingsName);
    const account = Neon.getAccountFromWIFKey(config.wif);
    const scriptHash = config.scriptHash;
    const args = [name, duration];
    const invoke = { operation: 'createSavings', scriptHash , args};
    const intents = [
        // { assetId: util.ASSETS['NEO'], value: 0, scriptHash }
    ];
    const gasCost = 0;

    node.executeTransaction(account, invoke, gasCost);
};

function sendNEOToSmartContract(savingsAddress, savingsName, amount) {
    const account = Neon.getAccountFromWIFKey(config.wif);
    const name = util.str2hex(savingsName);
    const address = util.str2hex(savingsAddress);
    const args = [address, name];
    const invoke = { operation: 'addFunds', scriptHash: config.scriptHash, args};
    const intents = [
        { assetId: util.ASSETS['NEO'], value: amount, scriptHash: config.scriptHash }
    ];
    const gasCost = 10;

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
 * @param endDate Date when saving should end.
 * @param time Period between payments (in minutes).
 * @param amount Amount in USD to deposit.
 * @param address Savings owner address
 * @param name Savings name/purpose
 */
exports.startPaymentCronjob = function (endDate, time, amount, address, name) {
    /*
     Should use pollingPolicy?
     const pollingPolicy = neo.service.createPollingPolicy(interval);
     pollingPolicy.onInterval(function () {
     });*/

    const endTime = new Date(endDate);
    const cronTime = `*/${time} * * * *`;

    makePayment(address, name, amount);
    return;

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
