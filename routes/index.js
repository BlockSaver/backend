/**
 * Module Dependencies
 */
const errors = require('restify-errors');

const paymentController = require('../controllers/payment.controller');

module.exports = function(server) {

    server.get('/test', (req, res, next) => {
        // paymentController.start_payment_cron("11.8.2017. 00:17", "seconds");
        paymentController.open_savings(10);
    });

    /**
     * POST
     * Create new savings subscription by
     * updating SC and setting a payment cronjob.
     */
    server.post({url: '/savings', validation: {
        content : {
            address: { isRequired: true },
            startTime: { isRequired: true },
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
        paymentController.open_savings(data.endTime, data.name);
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
    server.post('/withdrawal', (req, res, next) => {
        next();
    });

};
