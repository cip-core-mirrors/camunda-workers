const axios = require('axios');

require('../env'); // Load environment variables from .env file

const instance = axios.create({
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
    },
    baseURL: process.env.GITHUB_URL,
});

module.exports = instance;