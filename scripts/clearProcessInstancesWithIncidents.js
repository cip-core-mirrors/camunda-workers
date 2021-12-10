const axios = require('axios');

require('../env'); // Load environment variables from .env file

const baseUrl = process.env.CAMUNDA_ENGINE_URL;
const instance = axios.create({
    baseURL: baseUrl,
});

async function getProcessInstances(withIncident = false) {
    const response = await instance.get(`/process-instance?withIncident=${withIncident}`);
    return response.data;
}

async function deleteProcessInstances(processInstances = []) {
    for (const processInstance of processInstances) {
        await instance.delete(`/process-instance/${processInstance.id}`);
    }
}

async function execute() {
    const processInstances = await getProcessInstances(true);
    await deleteProcessInstances(processInstances);
}

execute();