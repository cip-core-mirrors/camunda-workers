const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-check-project';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('openshift_project_name');
        const processVariables = new Variables();
        try {
            const url = `/apis/project.openshift.io/v1/projects/${name}`;

            console.log(`[${topic}] GET ${url}`);
            const response = await openshift.get(url);

            console.log(response.data)

            processVariables.setAll({
                project_exists: true,
                openshift_project: response.data,
            });

            await taskService.complete(task, processVariables, processVariables);
        } catch (e) {
            const response = e.response;
            if (response) {
                if (response.status === 404) {
                    processVariables.setAll({
                        project_exists: false,
                    });
                    return await taskService.complete(task, processVariables, processVariables);
                }
            }

            throw e;
        }
    },
};