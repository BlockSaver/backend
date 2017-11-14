const Neon = require('neon-js');

const node = require("../services/blockchain");
const config = require('../config');

exports.Savings = (function(){
    function Savings(address, name, amount){
        this.name = name;
        this.address = address;
        this.amount = amount;
    }

    Savings.prototype.getAmount = function() {
        return this.amount;
    };
})();

exports.getSavingsState = function(savingsName) {
    const name = Neon.u.str2hexstring(savingsName);
    // Build script
    const sb = Neon.sc.default.create.scriptBuilder();
    sb.emitAppCall(config.scriptHash, "getSavingsByName", name);

    return node.execute_transaction(sb);
};

exports.makeSavingsWithdrawal = function(name, savingsState) {
    const balance = savingsState.NeoBalance;
    const duration = new Date(savingsState.duration);
    const currentDate = new Date();

};

exports.closeSavings = function (savingsName) {
    const name = Neon.u.str2hexstring(savingsName);
    // Build script
    const sb = Neon.sc.default.create.scriptBuilder();
    sb.emitAppCall(config.scriptHash, "closeSavings", name);

    const tx = node.execute_transaction(sb);
    console.log(tx);
};
