const { Variables, logger } = require('camunda-external-task-client-js');

const aws = require('../../../clients/aws');

const topic = 'aws-s3-bucket-list';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const namespace = task.variables.get('openshift_project_name');

        const response = await aws.listBuckets(namespace);
        console.log(response);

        const processVariables = new Variables();
        processVariables.setAll({
            buckets: response,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};