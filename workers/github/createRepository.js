const { Variables, logger } = require('camunda-external-task-client-js');

const github = require('../../clients/github');

const topic = 'github-create-repository';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const org_id = task.variables.get('github_organization_id');
        const repo = task.variables.get('github_repository_name');

        const processVariables = new Variables();
        try {
            const url = `/orgs/${org_id}/repos`;
            const body = {
                name: repo,
            };

            console.log(`[${topic}] POST ${url}\n${JSON.stringify(body)}`);
            const response = await github.post(url, body);

            processVariables.setAll({
                repository_created: true,
                github_repository: response.data,
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