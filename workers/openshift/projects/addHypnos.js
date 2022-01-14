const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-create-hypnos';

async function getHypnosInstances(topic) {
    const url = '/apis/shyrkaio.github.io/v1alpha1/hypnox';

    console.log(`[${topic}] GET ${url}`);
    const response = await openshift.get(url);

    return response.data.items;
}

async function createDefaultHypnos(namespace, topic) {
    const hypnosInstances = (await getHypnosInstances(topic)).filter(instance => instance.metadata.labels && instance.metadata.labels.namespace === namespace);
    const name = `${namespace}-${hypnosInstances.length + 1}`;
    return await createHypnosInstance(namespace, name, '0 9 * * *', '0 19 * * *', topic);
}

async function createHypnosInstance(namespace, name, wakeupCron, sleepCron, topic) {
    const url = '/apis/shyrkaio.github.io/v1alpha1/hypnox';

    const label = 'io.shyrka.erebus/hypnos';
    const spec = {
        targetedLabel: `${label}=${name}`,
        namespaceTargetedLabel: `${label}=${name}`,
        "cron-type": 'unix',
        "wakeup-cron": wakeupCron,
        "sleep-cron": sleepCron,
        comments: 'Generated from Bot',
        resourceType: [
            'Deployment',
            'HorizontalPodAutoscaler',
            'StatefulSet',
        ],
    };

    const body = {
        apiVersion: "shyrkaio.github.io/v1alpha1",
        kind: "Hypnos",
        metadata: {
            name: name,
            namespace: namespace, // disappears after for now
            labels: {
                namespace: namespace,
            },
        },
        spec: spec,
    };

    console.log(`[${topic}] POST ${url}\n${JSON.stringify(body)}`);
    const response = await openshift.post(url, body);

    return response.data;
}

async function updateNamespaceMetadata(projectName, annotations, labels, topic) {
    const url = `/api/v1/namespaces/${projectName}`;
    const body = {
        kind: "Namespace",
        apiVersion: "v1",
        metadata: {
            name: projectName,
            annotations: annotations,
            labels: labels,
        }
    };

    console.log(`[${topic}] PUT ${url}\n${JSON.stringify(body)}`);
    const response = await openshift.put(url, body);

    return response.data;
}

async function getProject(projectName, topic) {
    const url = `/apis/project.openshift.io/v1/projects/${projectName}`;

    console.log(`[${topic}] GET ${url}`);
    const response = await openshift.get(url);

    return response.data;
}

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const projectName = task.variables.get('openshift_project_name');
        const username = task.variables.get('openshift_username');

        const projectObj = await getProject(projectName, topic);

        const hypnosInstance = await createDefaultHypnos(projectName, topic);
        console.log(hypnosInstance.data);

        const annotations = {
            "openshift.io/requester": username,
            "openshift.io/description": projectObj.metadata.annotations['openshift.io/description'],
            "openshift.io/display-name": projectObj.metadata.annotations['openshift.io/display-name'],
        };
        const labels = {
            "redhat-cop.github.com/gatekeeper-active": "true",
        };
        const hypnosLabels = hypnosInstance.spec.namespaceTargetedLabel.split('=');
        labels[hypnosLabels[0]] = hypnosLabels[1];
        await updateNamespaceMetadata(projectName, annotations, labels, topic);

        const processVariables = new Variables();
        await taskService.complete(task, processVariables, processVariables);
    },
};