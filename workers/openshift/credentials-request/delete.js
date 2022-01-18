const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-credentials-request-delete';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const namespace = task.variables.get('openshift_project_name');
        const name = task.variables.get('s3_bucket_name');

        const url = `/apis/cloudcredential.openshift.io/v1/namespaces/${namespace}/credentialsrequests/${name}`;

        console.log(`[${topic}] DELETE ${url}`);
        const response = await openshift.delete(url);

        console.log(response.data);

        const processVariables = new Variables();
        processVariables.setAll({
            credentials_request_deleted: true,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};