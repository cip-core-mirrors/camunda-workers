for (const arg of process.argv.slice(2)) {
    try {
        require(`./${arg}`);
    } catch (e) {
        console.error(e);
    }
}