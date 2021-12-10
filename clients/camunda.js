const { Client, Variables, logger } = require('camunda-external-task-client-js');

require('../env'); // Load environment variables from .env file

const config = {
    baseUrl: process.env.CAMUNDA_ENGINE_URL,
    use: logger,
    maxTasks: 1,
    lockDuration: 5000,
};
const client = new Client(config);

module.exports = {
    client: client,
    Variables: Variables,
};