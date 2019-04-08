# :cow: APNIC Stats API

## Instructions

Documentation on all API end-points is available at `/docs` URL.

### Without Docker

Requirements for running the project are:

- Node.js
- npm
- (access to) MongoDB

Commands to run the project are:

- `npm install` to install all dependencies
- `npm start` or just `node dist` to run

Furthermore, multiple other commands are available for development:

- `npm install -d` to install all development dependencies
- `npm run lint` to lint the code
- `npm run build` to output ES5 code to `dist` directory
- `npm run bump` to upgrade all the dependencies (needs `sed` and `xargs`)

## Environment Variables

Listed here are environment variables with their defaults.

| Variable | default | required |
|---|---|---|
| `API_PORT` | `3000` | no |
| `LOG_COLLECTION` | `logs` | no |
| `LOG_LABEL` | `api` | no |
| `MONGO_HOST` | `localhost` | no |
| `MONGO_PORT` | `27017` | no |
| `MONGO_NAME` | `apnic` | no |
| `MONGO_USER` | `undefined` | no |
| `MONGO_PASS` | `undefined` | no |

## Usage

All API end-points are documented at `/docs` route of the running API server.
