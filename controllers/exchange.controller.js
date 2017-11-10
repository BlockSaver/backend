const defaultCurrency = 'USD';

function getNEOPrice(currency = defaultCurrency) {
    // TODO: fetch live ticker to get the last price
    return 30;  // 1 NEO = 30$
}

exports.calculateAmountOfNEO = function(amount, currency = defaultCurrency) {
    const price = getNEOPrice();
    return Math.round(amount / price);
};