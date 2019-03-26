# Adventure Mars Backend

This repo contains the code for the Adventure Mars Backend

Table of contents:
1. [Pre requirements](#pre-requirements)
2. [Configuration](#configuration)
3. [Running the app](#running-the-app)
4. [Build for production](#build-for-production)
5. [Documentation](#documentation)

## Pre requirements

- node.js v8.X.X
- MySQL server
- build essentials for your system
- create a DB called 'geocache' with utf8 encoding

## Configuration

You must have `gulp-cli` installed globally on your machine. You can install it running the following command:

```
npm install -g gulp-cli
```

and you must have all the project's dependencies installed. You can install them running the following command:

```
npm install
```

Then you must create a copy of `.env.example` called `.env` and put all your `env variables` there

```
cp .env.example .env
```

## Running the app

To run the app on development mode you need to run the following command

```
gulp watch
```

## Build for production

to build for production run the following command:

```
npm run build
```

## Documentation
Please read `backend/docs/Framework.md`.

You can read the API documentation at http://localhost:8888/apidoc/ when running locally

You can try examples for using the API with this Postman collection: https://www.getpostman.com/collections/93762bf02bd53fd26412
