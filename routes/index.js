/**
 * Module Dependencies
 */
const errors = require('restify-errors');

const paymentController = require('../controllers/payment.controller');

module.exports = function(server) {

    server.get('/test', (req, res, next) => {
        paymentController.start_payment_cron("test", "test");
        next();
    });

    /**
     * POST
     * Create new savings subscription by
     * updating SC and setting a payment cronjob.
     */
    server.post('/savings', (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'")
            );
        }

        const data = req.body;
        paymentController.create_savings(data);
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
