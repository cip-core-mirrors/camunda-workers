const { Variables, logger } = require('camunda-external-task-client-js');

const github = require('../../clients/github');

const topic = 'github-delete-repository';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const org_id = task.variables.get('github_organization_id');
        const repo = task.variables.get('github_repository_name');

        const url = `/repos/${org_id}/${repo}`;

        console.log(`[${topic}] DELETE ${url}`);
        await github.delete(url);

        const processVariables = new Variables();
        processVariables.setAll({
            repository_deleted: true,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};