const zeebe = require('zeebe-node');

const zbc = require('../clients/zeebe');

zbc.createWorker('retrieve-user-entity', async function(job, _, worker) {
    zbc.logVariables(job, worker);

    const { sesame } = job.variables;

    const output = {};
    output.entity = Math.random() > 0.5 ? 'GTS' : 'BSC';

    await job.complete(output);
}, {
    timeout: zeebe.Duration.seconds.of(5),
});