const zbc = require('../clients/zeebe');
const github = require('../clients/github');

zbc.createWorker('create-github-repository', async function(job, _, worker) {
    zbc.logVariables(job, worker);

    const output = {};

    const { org_id, repo } = job.variables;
    try {
        const repository = await github.post(`/orgs/${org_id}/repos`, {
            name: repo,
        });
        output.repo_created = true;
        output.repo = repository.data;
    } catch (e) {
        console.error(e);
        output.repo_created = false;
        output.error = JSON.parse(JSON.stringify(e));
    } finally {
        await job.complete(output);
    }
});