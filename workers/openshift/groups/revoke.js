const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-revoke-group';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('openshift_group_name');
        const user = task.variables.get('openshift_username');

        const url = `/apis/user.openshift.io/v1/groups/${name}`;

        const processVariables = new Variables();
        let response;
        try {
            response = await openshift.get(url);
        } catch (e) {
            return await taskService.handleFailure(task, {
                errorMessage: 'Group revoke error',
                errorDetails: 'Group does not exist',
            });
        }

        if (response) {
            const group = response.data;
            if (group.users.indexOf(user) !== -1) {
                group.users = group.users.filter(value => value !== user);
                console.log(`[${topic}] PUT ${url}`);
                await openshift.put(url, group);
            }

            processVariables.setAll({
                group_revoked: true,
            });
        } else {
            return await taskService.handleFailure(task, {
                errorMessage: 'Group revoke error',
                errorDetails: 'API response error',
            });
        }

        await taskService.complete(task, processVariables, processVariables);
    },
};