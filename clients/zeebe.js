const zeebe = require('zeebe-node');

// See options at https://www.npmjs.com/package/zeebe-node#client-side-retry
const zbc = new zeebe.ZBClient(process.env.ZEEBE_GATEWAY_ADDRESS);

async function onReady() {
    await pingTopology()
}

async function onConnectionError() {
    await pingTopology()
}

let firstCall = true
async function pingTopology() {
    const topology = await zbc.topology()
    if (firstCall) {
        console.log(JSON.stringify(topology, null, 2))
        firstCall = false
        const pingIntervalSeconds = process.env.ZEEBE_PING ? parseInt(process.env.ZEEBE_PING) : 60
        setInterval(pingTopology, pingIntervalSeconds * 1000)
    }
}

function logVariables(job, worker) {
    worker.log(`Task variables: ${JSON.stringify(job.variables)}`);
}

function createWorker(type, handler, options = {}) {
    Object.assign(options, {
        taskType: type,
        taskHandler: handler,
    });
    const zbWorker = zbc.createWorker(options);

    zbWorker.on('ready', () => console.log(`Worker "${type}" connected!`));
    zbWorker.on('connectionError', () => console.log(`Worker "${type}" disconnected!`));
}

zbc.on('ready', onReady);
zbc.on('connectionError', onConnectionError);

module.exports = {
    logVariables,
    createWorker,
};