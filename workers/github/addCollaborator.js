const { Variables, logger } = require('camunda-external-task-client-js');

const github = require('../../clients/github');

const topic = 'github-add-collaborator';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const org_id = task.variables.get('github_organization_id');
        const repo = task.variables.get('github_repository_name');
        const username = task.variables.get('github_username');
        const permission = task.variables.get('github_repo_permission');

        const url = `/repos/${org_id}/${repo}/collaborators/${username}`;
        const body = {
            permission: permission,
        };

        console.log(`[${topic}] PUT ${url}\n${JSON.stringify(body)}`);
        await github.put(url, body);

        const processVariables = new Variables();
        await taskService.complete(task, processVariables, processVariables);
    },
};