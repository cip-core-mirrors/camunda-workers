const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-check-group';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('openshift_group_name');
        const processVariables = new Variables();
        try {
            const url = `/apis/user.openshift.io/v1/groups/${name}`;

            console.log(`[${topic}] GET ${url}`);
            const response = await openshift.get(url);

            console.log(response.data)

            processVariables.setAll({
                group_exists: true,
                openshift_group: response.data,
            });

            await taskService.complete(task, processVariables, processVariables);
        } catch (e) {
            const response = e.response;
            if (response) {
                if (response.status === 404) {
                    processVariables.setAll({
                        group_exists: false,
                    });
                    return await taskService.complete(task, processVariables, processVariables);
                }
            }

            throw e;
        }
    },
};