const { Client, logger } = require('camunda-external-task-client-js');

require('../env'); // Load environment variables from .env file

const config = {
    baseUrl: process.env.CAMUNDA_ENGINE_URL,
    use: logger,
    maxTasks: 1,
    lockDuration: 5000,
    autoPoll: true,
};
const client = new Client(config);

const filesToImport = process.argv.slice(2);

function pollError(error) {
    process.exit(1);
}

client.on("poll:stop", pollError);
client.on('poll:error', pollError);

for (const arg of filesToImport) {
    try {
        const task = require(`./${arg}`);
        client.subscribe(task.topic, task.callback);
    } catch (e) {
        console.error(e);
    }
}