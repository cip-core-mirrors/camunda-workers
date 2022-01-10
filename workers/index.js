const { Client, logger } = require('camunda-external-task-client-js');

require('../env'); // Load environment variables from .env file

const config = {
    baseUrl: process.env.CAMUNDA_ENGINE_URL,
    use: logger,
    maxTasks: 1,
    lockDuration: 15000,
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
        const taskRequire = require(`./${arg}`);
        client.subscribe(taskRequire.topic, async function({ task, taskService }) {
            try {
                await taskRequire.callback({ task, taskService });
            } catch (e) {
                const response = e.response;
                if (response) {
                    const responseData = response.data;
                    console.error(responseData);
                    await taskService.handleFailure(task, {
                        errorMessage: responseData.error_description || responseData.message || 'API unknown error',
                        errorDetails: JSON.stringify(responseData),
                    });
                } else {
                    console.error(e);
                    await taskService.handleFailure(task, {
                        errorMessage: 'Server unknown error',
                        errorDetails: e.toString(),
                    });
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
}