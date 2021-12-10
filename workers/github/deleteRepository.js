const { client, Variables } = require('../../clients/camunda');
const github = require('../../clients/github');

const topic = 'github-delete-repository';
client.subscribe(topic, async function({ task, taskService }) {
    console.log(`[${topic}] task ${task.id}`);

    const org_id = task.variables.get('github_organization_id');
    const repo = task.variables.get('github_repository_name');

    const processVariables = new Variables();
    try {
        const response = await github.delete(`/repos/${org_id}/${repo}`);

        processVariables.setAll({
            repository_deleted: true,
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
});
