const config = require('./config');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const restifyValidation = require('node-restify-validation');
const restifyErrors = require('restify-errors');

/**
 * Initialize Server
 */
const server = restify.createServer({
    name: config.name,
    version: config.version,
});

/**
 * Middleware
 */
server.use(restifyPlugins.jsonBodyParser({ mapParams: false }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
server.use(restifyValidation.validationPlugin( {
    // Shows errors as an array
    errorsAsArray: false,
    // Not exclude incoming variables not specified in validator rules
    forbidUndefinedVariables: false,
    errorHandler: restifyErrors.InvalidArgumentError
}));
/**
 * Start Server
 */
server.listen(config.port, function() {
    require('./routes')(server);
    console.log('Express server listening on port ' + config.port);
});
