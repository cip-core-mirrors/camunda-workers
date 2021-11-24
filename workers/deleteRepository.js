const zbc = require('../clients/zeebe');
const github = require('../clients/github');

zbc.createWorker('delete-github-repository', async function(job, _, worker) {
    zbc.logVariables(job, worker);

    const output = {};

    const { org_id, repo } = job.variables;
    try {
        const repository = await github.delete(`/repos/${org_id}/${repo}`);
        output.repo_deleted = true;
    } catch (e) {
        console.error(e);
        output.repo_deleted = false;
        output.error = JSON.parse(JSON.stringify(e));
    } finally {
        await job.complete(output);
    }
});
