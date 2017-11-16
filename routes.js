/**
 * Module Dependencies
 */
const errors = require('restify-errors');

const paymentController = require('./controllers/payment.controller.js');
const savings = require('./services/savings');
const Savings = require('./models/savings');

module.exports = function(server) {
    /**
     * POST
     * Create new savings subscription by
     * updating SC and setting a payment cronjob.
     */
    server.post({url: '/savings', validation: {
        content : {
            address: { isRequired: true },
            endTime: { isRequired: true },
            interval: { isRequired: true, isNatural: true },
            amount: { isRequired: true },
            name: { isRequired: true },
        }
    }}, (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }

        const data = req.body;
        const savings = new Savings(data.address, data.endTime, data.interval, data.amount, data.name);
        paymentController.startPaymentCronjob(savings);
    });

    /**
     * End the savings and make a withdrawal.
     */
    server.post({url: '/requestwithdrawal', validation: {
        content : {
            address: { isRequired: true },
            name: { isRequired: true },
        }
    }}, (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }

        const data = req.body;
        const state = savings.getSavingsState(data.name);
        savings.makeSavingsWithdrawal(data.name, state);
        savings.closeSavings(data.name);
    });

};
