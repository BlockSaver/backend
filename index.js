const config = require('./config');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');

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
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());

/**
 * Start Server
 */
server.listen(config.port, function() {
    require('./routes')(server);
    console.log('Express server listening on port ' + config.port);
});
