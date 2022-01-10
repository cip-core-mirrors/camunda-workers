const { Variables, logger } = require('camunda-external-task-client-js');

const topic = 'wait';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const seconds = parseInt(task.variables.get('seconds') || '10');
        await sleep(seconds * 1000);

        const processVariables = new Variables();
        await taskService.complete(task, processVariables, processVariables);
    },
};