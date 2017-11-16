const Neon = require('neon-js');

const node = require("../services/blockchain");
const config = require('../config');
const util = require('../util');

module.exports = {
    getSavingsState: function(savingsName) {
        const name = util.str2hex(savingsName);
        const account = Neon.getAccountFromWIFKey(config.wif);
        const args = [account.publicKeyEncoded, name];
        const operation = 'getSavingsByName';
        let invoke = { operation, scriptHash: config.scriptHash, args};
        const gasCost = 1;

        node.testInvokeRPC(config.scriptHash, operation, args).then((response) => {
            if (response.result) {
                node.executeTransaction(account, invoke, gasCost);
            }
        });
    },

    makeSavingsWithdrawal: function(savingsName, savingsState) {
        const duration = new Date(savingsState.duration);
        const currentDate = new Date();

        let amountToWithdraw = savingsState.NeoBalance;
        if (duration < currentDate) {
            // Savings are ending before defined date.
            // Take 10% percentage.
            amountToWithdraw *= 0.9;
        }

        // Send savings to owner
        const name = util.str2hex(savingsName);
        const account = Neon.getAccountFromWIFKey(config.wif);
        const args = [name];
        const invoke = { operation: 'transfer', scriptHash: config.scriptHash, args};
        const intents = [
            { assetId: util.ASSETS['NEO'], value: amountToWithdraw, scriptHash: config.scriptHash }
        ];
        const gasCost = 0;

        return node.executeTransaction(account, invoke, gasCost, intents);
    },

    closeSavings: function(savingsName) {
        const name = util.str2hex(savingsName);
        const account = Neon.getAccountFromWIFKey(config.wif);
        const args = [name];
        const invoke = { operation: 'closeSavings', scriptHash: config.scriptHash, args};
        const gasCost = 1;

        return node.executeTransaction(account, invoke, gasCost);
    }
};
