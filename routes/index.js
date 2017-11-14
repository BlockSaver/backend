/**
 * Module Dependencies
 */
const errors = require('restify-errors');

const paymentController = require('../controllers/payment.controller');
const getSavingsState = require('../services/savings');
const makeSavingsWithdrawal = require('../services/savings');
const closeSavings = require('../services/savings');

module.exports = function(server) {

    server.get('/test', (req, res, next) => {
        const endDate = new Date().getTime() + 1000;
        paymentController.open_savings(endDate, "Testing bab bam");
        // paymentController.start_payment_cron(data.endTime, data.time, data.amount, data.address, data.name);
    });

    /**
     * POST
     * Create new savings subscription by
     * updating SC and setting a payment cronjob.
     */
    server.post({url: '/savings', validation: {
        content : {
            address: { isRequired: true },
            endTime: { isRequired: true },
            time: { isRequired: true, isNatural: true },
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
        // TODO: Create savings model here
        paymentController.open_savings(data.endTime, data.name);
        paymentController.start_payment_cron(data.endTime, data.time, data.amount, data.address, data.name);
    });

    /**
     * LIST
     * Get savings by address from SC.
     */
    server.get('/savings', (req, res, next) => {
        res.send({"title": "testtsts"});
        next();
    });

    /**
     * Make a subscription payment to SC
     */
    server.post('/payment', (req, res, next) => {
        if (!req.is('application/json')) {
        return next(
            new errors.InvalidContentError("Expects 'application/json'")
        );
    }

        const data = req.body;
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
        const state = getSavingsState(data.name);
        makeSavingsWithdrawal(data.name, state);
        closeSavings(name);
    });

};
