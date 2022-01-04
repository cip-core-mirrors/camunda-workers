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

        const processVariables = new Variables();
        try {
            await github.put(`/repos/${org_id}/${repo}/collaborators/${username}`, {
                permission: permission,
            });

            await taskService.complete(task, processVariables, processVariables);
        } catch (e) {
            const response = e.response;
            if (response) {
                const responseData = response.data;
                console.error(responseData);
                await taskService.handleFailure(task, {
                    errorMessage: responseData.message || 'GitHub API unknown error',
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