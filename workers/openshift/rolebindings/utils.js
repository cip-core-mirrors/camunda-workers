const openshift = require('../../../clients/openshift');

async function getRoleBindings(projectName, topic) {
    let url;
    if (projectName === undefined) {
        url = '/apis/rbac.authorization.k8s.io/v1/rolebindings';
    } else {
        url = `/apis/authorization.openshift.io/v1/namespaces/${projectName}/rolebindings`;
    }

    console.log(`[${topic}] GET ${url}`);
    const rolebindings = await openshift.get(url);

    return rolebindings.data;
}

async function getRoleBinding(roleName, projectName, topic) {
    const roleBindings = await getRoleBindings(projectName, topic);

    for (const rolebinding of roleBindings.items) {
        if (rolebinding.metadata.name === roleName) {
            if (rolebinding.subjects === undefined) {
                rolebinding.subjects = [];
            }
            rolebinding.roleRef.kind = rolebinding.roleRef.kind || 'ClusterRole';
            return rolebinding;
        }
    }
}

async function createRoleBinding(roleName, projectName, topic) {
    const url = `/apis/rbac.authorization.k8s.io/v1/namespaces/${projectName}/rolebindings`;
    const body = {
        kind: 'RoleBinding',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
            name: roleName,
        },
        roleRef: {
            kind: 'ClusterRole',
            name: roleName,
        },
    };

    console.log(`[${topic}] POST ${url}\n${JSON.stringify(body)}`);
    const response = await openshift.post(url, body);

    const role = response.data;
    role.subjects = [];

    return role;
}

async function updateRoleBinding(roleBinding, projectName, topic) {
    const url = `/apis/rbac.authorization.k8s.io/v1/namespaces/${projectName}/rolebindings/${roleBinding.metadata.name}`;

    console.log(`[${topic}] PUT ${url}\n${JSON.stringify(roleBinding)}`);
    const response = await openshift.put(url, roleBinding);

    return response.data;
}

module.exports = {
    getRoleBinding,
    createRoleBinding,
    updateRoleBinding,
};