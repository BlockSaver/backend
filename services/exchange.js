const axios = require("axios");


const defaultCurrency = 'usd';

function getPrice(coin = 'NEO', currency = defaultCurrency) {
    return axios.get(`https://api.coinmarketcap.com/v1/ticker/${coin}/?convert=${currency}`)
        .then((res) => {
            const data = res.data;
            if (data.error) throw new Error(data.error);
            const price = data[0][`price_${currency}`];
            if (price) return parseInt(price, 10);
            else throw new Error(`Something went wrong with the CoinMarketCap API.`);
        })
}

module.exports = {

    calculateAmountOfNEO: function(amount) {
        return getPrice().then(price => {
            return Math.round(amount / price);
        });
    },

};