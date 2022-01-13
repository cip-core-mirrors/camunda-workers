const { Variables, logger } = require('camunda-external-task-client-js');

const utils = require('./utils');

const topic = 'openshift-project-add-user';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const projectName = task.variables.get('openshift_project_name');
        const roleName = task.variables.get('openshift_rolename');

        const roleBinding = await utils.getRoleBinding(roleName, projectName, topic) || await utils.createRoleBinding(roleName, projectName, topic)

        const userName = task.variables.get('openshift_username');
        const kind = task.variables.get('openshift_rolekind');
        roleBinding.subjects.push({
            kind: kind,
            apiGroup: 'rbac.authorization.k8s.io',
            name: userName,
        });

        const response = await utils.updateRoleBinding(roleBinding, projectName, topic);
        console.log(response.data);

        const processVariables = new Variables();
        await taskService.complete(task, processVariables, processVariables);
    },
};