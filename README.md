# camunda-workers

This repository gathers some workers in order to subscribe and complete [Camunda's External Tasks](https://docs.camunda.org/manual/latest/user-guide/process-engine/external-tasks/).

To create your own workers, see [2. Create your own workers](#create-your-own-workers)

## 1. Usage

### a. Installation

```bash
npm install
```

### b. Start

```bash
npm run start path/to/script1 path/to/script2 ... path/to/scriptN

# Example
npm run start github/checkRepository github/createRepository github/deleteRepository keycloak/retrieveUserInfo
```

Some workers need extra environment variables in order to run :

| Name                 | Description                                                         | Needed by script               |
|----------------------|---------------------------------------------------------------------|--------------------------------|
| `CAMUNDA_ENGINE_URL` | URL of the Camunda engine                                           | all                            |
| `GITHUB_URL`         | Base URL of the GitHub server to use (ex: `https://api.github.com`) | `github/*`                     |
| `GITHUB_TOKEN`       | Token of the GitHub account to use                                  | `github/*`                     |
| `USERINFO_URL`       | URL where Keycloak user information can be retrieved                | `keycloak/retrieveUserInfo.js` |

## 2. Create your own workers

Create a JS file with the following exports :

```javascript
module.exports = {
    topic: 'my-topic',
    callback: async function({ task, taskService }) {
       /*
       Your code here
       */
    },
};
```

[Full documentation](https://github.com/camunda/camunda-external-task-client-js#features) of `task` and `taskService` variables

## 3. Workers lifecycle

![Diagram](/docs/Diagram.png?raw=true)
