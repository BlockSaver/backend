const neo = require('neo-api-js');

const config = require('../config');

module.exports = {

    getBalance: (address) => {
        const node = neo.node(config.RPCEndpoint);
        return node.getBalance(address);
    },

    getNode: () => (
        neo.node(config.RPCEndpoint)
    )
};
