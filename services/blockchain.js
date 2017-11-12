const neo = require('neo-api-js');

const node = require("../services/blockchain");
const config = require('../config');

module.exports = {

    getBalance: (address) => {
        const node = neo.node(config.RPCEndpoint);
        return node.getBalance(address);
    },

    getNode: () => (
        neo.node(config.RPCEndpoint)
    ),

    execute_transaction: (sb) => {
        // Test the script with invokescript
        Neon.rpc.Query.invokeScript(sb.str).execute(node.getNode());
        // Create InvocationTransaction for real execution
        const account = Neon.sc.default.create.account(config.wif);
        return Neon.sc.default.create.invocationTx(account.publicKey, {}, {}, sb.str, 0);
    }
};
