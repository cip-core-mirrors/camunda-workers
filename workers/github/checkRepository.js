const { Variables, logger } = require('camunda-external-task-client-js');

const github = require('../../clients/github');

const topic = 'github-check-repository';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const org_id = task.variables.get('github_organization_id');
        const repo = task.variables.get('github_repository_name');

        const processVariables = new Variables();
        try {
            const url = `/repos/${org_id}/${repo}`;

            console.log(`[${topic}] GET ${url}`);
            const response = await github.get(url);
            processVariables.setAll({
                repository_exists: true,
                github_repository: response.data,
            });

            await taskService.complete(task, processVariables, processVariables);
        } catch (e) {
            const response = e.response;
            if (response) {
                if (response.status === 404) {
                    processVariables.setAll({
                        repository_exists: false,
                    });
                    return await taskService.complete(task, processVariables, processVariables);
                }
            }
            throw e;
        }
    },
};
