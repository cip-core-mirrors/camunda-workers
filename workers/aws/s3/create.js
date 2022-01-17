const { Variables, logger } = require('camunda-external-task-client-js');

const aws = require('../../../clients/aws');

const topic = 'aws-s3-bucket-create';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const namespace = task.variables.get('openshift_project_name');
        const name = task.variables.get('s3_bucket_name');

        const response = await aws.createBucket(namespace, name);
        console.log(response);

        const processVariables = new Variables();
        processVariables.setAll({
            bucket_created: true,
            bucket_location: response.Location,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};