const axios = require('axios');
const { Variables, logger } = require('camunda-external-task-client-js');

const url = process.env.USERINFO_URL;

const topic = 'keycloak-check-access-token';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const accessToken = task.variables.get('keycloak_access_token');
        if (!accessToken) return await taskService.handleFailure(task, {
            errorMessage: "no access token provided",
        });

        try {
            console.log(`[${topic}] GET ${url}`);
            const response = await axios.get(url, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            });
            const processVariables = new Variables();
            processVariables.setAll({
                keycloak_authenticated: 'true',
                keycloak_userinfo: response.data,
            });

            await taskService.complete(task, processVariables, processVariables);
        } catch (e) {
            const errorResponse = e.response.data;
            console.error(errorResponse);
            await taskService.handleFailure(task, {
                errorMessage: errorResponse.error_description,
            });
        }
    },
};