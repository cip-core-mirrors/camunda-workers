const { Variables, logger } = require('camunda-external-task-client-js');

const openshift = require('../../../clients/openshift');

const topic = 'openshift-credentials-request-create';

module.exports = {
    topic: topic,
    callback: async function({ task, taskService }) {
        console.log(`[${topic}] task ${task.id}`);

        const namespace = task.variables.get('openshift_project_name');
        const name = task.variables.get('s3_bucket_name');

        const url = `/apis/cloudcredential.openshift.io/v1/namespaces/${namespace}/credentialsrequests`;

        const bucketPrefix = process.env.AWS_BUCKET_PREFIX;
        const fullName = `${bucketPrefix}-${namespace}-${name}`;

        const statementEntry1 = {
            effect: 'Allow',
            resource: `arn:aws:s3:::${fullName}`,
            action: [
                's3:ListBucket',
            ],
        };
        const statementEntry2 = {
            effect: 'Allow',
            resource: `arn:aws:s3:::${fullName}/*`,
            action: [
                's3:DeleteObject',
                's3:GetObject',
                's3:PutObject',
                's3:ReplicateObject',
                's3:RestoreObject',
            ],
        };

        const statementEntries = [];
        statementEntries.push(statementEntry1);
        statementEntries.push(statementEntry2);

        const providerSpec = {
            apiVersion: 'cloudcredential.openshift.io/v1',
            kind: 'AWSProviderSpec',
            statementEntries: statementEntries,
        };

        const secretRef = {
            name: name,
            namespace: namespace,
        };

        const spec = {
            providerSpec: providerSpec,
            secretRef: secretRef,
        };

        const body = {
            apiVersion: "cloudcredential.openshift.io/v1",
            kind: "CredentialsRequest",
            metadata: {
                name: fullName,
                namespace: namespace,
            },
            spec: spec,
        };

        console.log(`[${topic}] POST ${url}\n${JSON.stringify(body)}`);
        const response = await openshift.post(url, body);

        console.log(response.data);

        const processVariables = new Variables();
        processVariables.setAll({
            credentials_request_created: true,
            credentials_request: response.data,
        });

        await taskService.complete(task, processVariables, processVariables);
    },
};