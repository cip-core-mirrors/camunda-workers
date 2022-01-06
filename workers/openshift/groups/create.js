const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-create-group';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('openshift_group_name');
        const users = task.variables.get('openshift_group_user');
        try {
            const url = `/apis/user.openshift.io/v1/groups`;
            const body = {
                kind: "Group",
                apiVersion: "user.openshift.io/v1",
                metadata: {
                    name: name,
                    labels: {
                        "openshift.io/ldap.host": "ldap.cip-ldap-common.svc.cluster.local",
                    },
                    annotations: {
                        "openshift.io/ldap.uid": `cn=${name},ou=groups,ou=dev,ou=iam,dc=sgcip,dc=com`,
                        "openshift.io/ldap.url": "ldap.cip-ldap-common.svc.cluster.local:389",
                    },
                },
                users: users,
            };

            console.log(`[${topic}] POST ${url}\n${JSON.stringify(body)}`);
            const response = await openshift.post(url, body);
        
            const processVariables = new Variables();
            processVariables.setAll({
                group_created: true,
                openshift_group: response.data,
            });

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