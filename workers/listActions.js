const zeebe = require('zeebe-node');

const zbc = require('../clients/zeebe');

zbc.createWorker('list-github-actions', async function(job, _, worker) {
    zbc.logVariables(job, worker);
    await job.complete({
        available_actions: [
            'create-repository',
            'delete-repository',
        ],
    });
}, {
    timeout: zeebe.Duration.seconds.of(5),
});