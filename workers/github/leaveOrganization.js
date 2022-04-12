const { Variables, logger } = require('camunda-external-task-client-js');

const github = require('../../clients/github');

const topic = 'github-leave-organization';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);
        const org_id = task.variables.get('github_organization_id');
        const username = task.variables.get('github_username');
        const url = `/orgs/${org_id}/members/${username}`;
        console.log(`[${topic}] DELETE ${url}`);
        await github.delete(url);
        const processVariables = new Variables();
        processVariables.setAll({
            user_removed: true,
        });
        await taskService.complete(task, processVariables, processVariables);
    },
};
