const axios = require('axios');
const https = require('https');

const config = {
    headers: { Authorization: `Bearer ${process.env.OPENSHIFT_TOKEN}` },
    httpsAgent: new https.Agent({
        rejectUnauthorized: process.env.INSECURE_REQUESTS !== 'true',
    }),
}

const instance = axios.create({
    baseURL: process.env.OPENSHIFT_URL,
    headers: config.headers,
    httpsAgent: config.httpsAgent,
});

module.exports = instance;