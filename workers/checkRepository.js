const zbc = require('../clients/zeebe');
const github = require('../clients/github');

zbc.createWorker('check-github-repository', async function(job, _, worker) {
    zbc.logVariables(job, worker);

    const output = {};

    const { org_id, repo } = job.variables;
    try {
        const repository = await github.get(`/repos/${org_id}/${repo}`);
        output.repo_exists = true;
        output.repo = repository.data;
    } catch (e) {
        output.repo_exists = false;
    } finally {
        await job.complete(output);
    }
});
