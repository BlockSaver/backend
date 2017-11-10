const neo = require('neo-api-js');

const config = require('../config');

module.exports = {

    getBalance: (address) => {
        const node = neo.node(config.RPCEndpoint);
        console.log(address);
        return node.getBalance(address);
    },

    queryRPC: (node, method, params) => {
        const jsonRequest = _axios2.default.create({ headers: { 'Content-Type': 'application/json' } });
        const jsonRpcData = { method: method, params: params, id: id, jsonrpc: '2.0' };
        return getRPCEndpoint(net).then(function (rpcEndpoint) {
            return jsonRequest.post(rpcEndpoint, jsonRpcData).then(function (response) {
                return response.data;
            });
        });
    }
};
