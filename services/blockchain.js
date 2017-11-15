const neo = require('neo-api-js');
const Neon = require('neon-js');

const config = require('../config');
const axios = require("axios");

module.exports = {

    getBalance: (address) => {
        return axios.get(config.RESTEndpoint + '/v2/address/balance/' + address)
            .then((res) => {
                return res.data
            })
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

    executeTransaction: (fromAccount, invoke, gasCost, intents = []) => {
        return module.exports.getBalance(fromAccount.address).then((balances) => {
            const unsignedTx = Neon.create.invocation(fromAccount.publicKeyEncoded, balances, intents, invoke, gasCost, { version: 1 });
            const signedTx = Neon.signTransaction(unsignedTx, fromAccount.privateKey);
            const hexTx = Neon.serializeTransaction(signedTx);
            return module.exports.queryRPC('sendrawtransaction', [hexTx]);
        }).catch(function(error) {
            console.log(error);
        }).then((res) => {
            console.log(res);
        })
    }
};
