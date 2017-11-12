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
const calculateAmountOfNEO = require("./../services/exchange.js");
const closeSavings = require("./../services/savings");

exports.open_savings = function (deadline, name) {
    const name = Neon.u.str2hexstring(name);
    // Build script
    const sb = Neon.sc.default.create.scriptBuilder();
    sb.emitAppCall(config.scriptHash, "create", [name, deadline]);

    const tx = node.execute_transaction(sb);
    console.log(tx);
};

function sendNEOToSmartContract(address, name, amount) {
    const name = Neon.u.str2hexstring(name);
    // Build script
    const sb = Neon.sc.default.create.scriptBuilder();
    sb.emitAppCall(config.scriptHash, "addFunds", [address, name, amount]);

    const tx = node.execute_transaction(sb);
    console.log(tx);
}

function makePayment(address, name, amount) {
    const NEOAmount = calculateAmountOfNEO(amount);
    sendNEOToSmartContract(address, name, NEOAmount);
}

/**
 * Start cronjob to run every `time` minutes.
 * We use minutes just for development purposes.
 * @param endTime Date when saving should end.
 * @param time Period between payments (in minutes).
 * @param amount Amount in USD to deposit.
 * @param address Savings owner address
 * @param name Savings name/purpose
 */
exports.start_payment_cron = function (endTime, time, amount, address, name) {
    /*
     Should use pollingPolicy?
     const pollingPolicy = neo.service.createPollingPolicy(interval);
     pollingPolicy.onInterval(function () {
     });*/

    const endTime = new Date(endTime);
    const cronTime = `*/${time} * * * *`;

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
