module.exports = class Savings {
    constructor(address, endTime, interval, amount, name) {
        this.address = address;
        this.endTime = endTime;
        this.interval = interval;
        this.name = name;
        this.amount = amount;
    }

    getAmount() {
        return this.amount;
    };

    getEndTime() {
        return this.endTime;
    };

    getAddress() {
        return this.address;
    };

    getName() {
        return this.name;
    };

    getInterval() {
        return this.interval;
    };
};