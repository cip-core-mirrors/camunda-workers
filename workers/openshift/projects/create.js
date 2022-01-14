const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-create-project';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const projectName = task.variables.get('openshift_project_name');

        const url = `/apis/project.openshift.io/v1/projectrequests`;

        /*
        const defaultNodeSelectors = {
            "machine.openshift.io/cluster-api-cluster": projectName,
        }
        */

        const body = {
            kind: "ProjectRequest",
            apiVersion: "project.openshift.io/v1",
            metadata: {
                name: projectName,
                annotations: {
                    //"openshift.io/node-selector": Object.entries(defaultNodeSelectors).map(entry => `${entry[0]}=${entry[1]}`).join(','),
                },
            },
        };

        console.log(`[${topic}] POST ${url}\n${JSON.stringify(body)}`);
        const response = await openshift.post(url, body);
        console.log(response.data);

        const processVariables = new Variables();
        processVariables.setAll({
            project_created: true,
            openshift_project: response.data,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};