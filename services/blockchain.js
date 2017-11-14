const neo = require('neo-api-js');
const Neon = require('neon-js');

const config = require('../config');
const axios = require("axios");

module.exports = {

    getBalance: (address) => {
        return axios.get(config.RESTEndpoint + '/v2/address/balance/' + address)
            .then((res) => {
                return res.data
                // const neo = res.data.NEO.balance
                // const gas = res.data.GAS.balance
                // return { Neo: neo, Gas: gas, unspent: { Neo: res.data.NEO.unspent, Gas: res.data.GAS.unspent } }
            })
    },

    getNode: () => {
        return neo.node(config.RPCEndpoint)
    },

    getRPCEndpoint: () => {
        return axios.get(config.RESTEndpoint + '/v2/network/best_node').then(function (response) {
            return response.data.node;
        });
    },

    queryRPC: (method, params, id = 1) => {
        const jsonRequest = axios.create({ headers: { 'Content-Type': 'application/json' } });
        const jsonRpcData = { method, params, id, jsonrpc: '2.0' };
        return module.exports.getRPCEndpoint().then(function (rpcEndpoint) {
            return jsonRequest.post(rpcEndpoint, jsonRpcData).then(function (response) {
                return response.data;
            });
        });
    },

    execute_transaction: (sb) => {
        // Test the script with invokescript
        const node = neo.node(config.RPCEndpoint);
        Neon.rpc.Query.invokeScript(sb.str).execute(node);
        // Create InvocationTransaction for real execution
        const account = Neon.sc.default.create.account(config.wif);
        const invoke = { operation: 'createSavings', scriptHash: sb.str };
        return tx.create.createInvocationTx(account.publicKey, {}, {}, invoke, 0);
    }
};
