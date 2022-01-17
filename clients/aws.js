const AWS = require('aws-sdk');

const bucketPrefix = process.env.AWS_BUCKET_PREFIX;

const awsRegion = process.env.AWS_REGION;
// Create S3 service object
const s3 = new AWS.S3({
    region: awsRegion,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function listBuckets(namespace) {
    const promise = new Promise(function(resolve, reject) {
        console.log(`[AWS S3] List Buckets`);
        s3.listBuckets(function(err, data) {
            if (err) {
                reject(err);
            } else {
                if (namespace) data.Buckets = data.Buckets.filter(bucket => bucket.Name.indexOf(`${bucketPrefix}-${namespace}`) === 0);
                resolve(data);
            }
        });
    });

    return await promise;
}

async function createBucket(namespace, name) {
    const fullName = `${bucketPrefix}-${namespace}-${name}`;
    const params = {
        Bucket: fullName,
        CreateBucketConfiguration: {
            LocationConstraint: awsRegion,
        },
    };

    const promise = new Promise(function(resolve, reject) {
        console.log(`[AWS S3] Create Bucket ${fullName}`);
        s3.createBucket(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    return await promise;
}

async function deleteBucket(name) {
    const params = {
        Bucket: name,
    };

    const promise = new Promise(function(resolve, reject) {
        console.log(`[AWS S3] Delete Bucket ${name}`);
        s3.deleteBucket(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    return await promise;
}

module.exports = {
    listBuckets,
    createBucket,
    deleteBucket,
};