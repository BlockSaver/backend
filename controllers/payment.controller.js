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
const util = require('../util');


exports.open_savings = function (duration, savingsName) {
    const name = util.str2hex(savingsName);
    const account = Neon.getAccountFromWIFKey(config.wif);
    const scriptHash = config.scriptHash;
    const args = [name, duration];
    const invoke = { operation: 'createSavings', scriptHash , args};
    const intents = [{ assetId: util.ASSETS['NEO'], value: 0, scriptHash }];
    const gasCost = 10;
    let signedTx;

    node.getBalance(account.address).then((balances) => {
        const unsignedTx = Neon.create.invocation(account.publicKeyEncoded, balances, intents, invoke, gasCost, { version: 1 });
        signedTx = Neon.signTransaction(unsignedTx, account.privateKey);
        const hexTx = Neon.serializeTransaction(signedTx);
        return node.queryRPC('sendrawtransaction', [hexTx]);
    }).catch(function(error) {
        console.log(error);
    }).then((res) => {
        console.log(res);
    })
};

function sendNEOToSmartContract(address, savingsName, amount) {
    const name = Neon.u.str2hexstring(savingsName);
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
 * @param endDate Date when saving should end.
 * @param time Period between payments (in minutes).
 * @param amount Amount in USD to deposit.
 * @param address Savings owner address
 * @param name Savings name/purpose
 */
exports.start_payment_cron = function (endDate, time, amount, address, name) {
    /*
     Should use pollingPolicy?
     const pollingPolicy = neo.service.createPollingPolicy(interval);
     pollingPolicy.onInterval(function () {
     });*/

    const endTime = new Date(endDate);
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
