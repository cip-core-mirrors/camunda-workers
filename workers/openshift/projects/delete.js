const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-delete-project';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('openshift_project_name');

        const url = `/apis/project.openshift.io/v1/projects/${name}`;

        const processVariables = new Variables();
        let response;
        try {
            response = await openshift.get(url);
        } catch (e) {
            return await taskService.handleFailure(task, {
                errorMessage: 'Project delete error',
                errorDetails: 'Project does not exist',
            });
        }

        if (response) {
            console.log(`[${topic}] DELETE ${url}`);
            await openshift.delete(url);
            processVariables.setAll({
                project_deleted: true,
            });
        } else {
            return await taskService.handleFailure(task, {
                errorMessage: 'Project delete error',
                errorDetails: 'API response error',
            });
        }

        await taskService.complete(task, processVariables, processVariables);
    },
};