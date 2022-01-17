const { Variables, logger } = require('camunda-external-task-client-js');

const aws = require('../../../clients/aws');

const topic = 'aws-s3-bucket-delete';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const name = task.variables.get('s3_bucket_name');

        const response = await aws.deleteBucket(name);
        console.log(response);

        const processVariables = new Variables();
        processVariables.setAll({
            bucket_deleted: true,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};