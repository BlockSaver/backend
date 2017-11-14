module.exports = {
    ASSETS: {
        NEO: 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
        'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b': 'NEO',
        GAS: '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7',
        '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7': 'GAS'
    },

    int2hex: (mNumber) => {
        const h = mNumber.toString(16);
        return h.length % 2 ? '0' + h : h;
    },

    /**
     * Converts a number to a hexstring of a suitable size
     * @param {number} num
     * @param {number} size - The required size in chars, eg 2 for Uint8, 4 for Uint16. Defaults to 2.
     */
    num2hexstring: (num, size = 2) => {
        let hexstring = num.toString(16);
        return hexstring.length % size === 0 ? hexstring : ('0'.repeat(size) + hexstring).substring(hexstring.length);
    },

    str2hex: (str) => {
        let hex;
        let result = "";
        for (let i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ("000" + hex).slice(-4);
        }

        return result;
    }
};
