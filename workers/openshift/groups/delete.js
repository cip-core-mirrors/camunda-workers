const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-delete-group';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('openshift_group_name');
        const user = task.variables.get('openshift_username');
        try {
            const url = `/apis/user.openshift.io/v1/groups/${name}`;

            const processVariables = new Variables();
            let response;
            try {
                response = await openshift.get(url);
            } catch (e) {
                return await taskService.handleFailure(task, {
                    errorMessage: 'Group delete error',
                    errorDetails: 'Group does not exist',
                });
            }

            if (response) {
                const group = response.data;
                if (group.users.indexOf(user) !== -1) {
                    console.log(`[${topic}] DELETE ${url}`);
                    await openshift.delete(url);
                    processVariables.setAll({
                        group_deleted: true,
                    });
                } else {
                    return await taskService.handleFailure(task, {
                        errorMessage: 'Group delete error',
                        errorDetails: 'Not member of this group',
                    });
                }
            } else {
                return await taskService.handleFailure(task, {
                    errorMessage: 'Group delete error',
                    errorDetails: 'Group does not exist',
                });
            }

            await taskService.complete(task, processVariables, processVariables);
        } catch (e) {
            const response = e.response;
            if (response) {
                const responseData = response.data;
                console.error(responseData);
                await taskService.handleFailure(task, {
                    errorMessage: responseData.message || 'API unknown error',
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
    },
};