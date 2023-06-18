# Yle teletext api demo

## Overview

This is a basic demo application for [Yle's teletext api][yle teletext api]. It lets you view images of past teletext pages. The application takes a snapshot of all available teletext pages at regular intervals and provides an api for querying these snapshots based on time.

## Prerequisites

You only need Docker and Docker compose to use this service. However, if you want to do local development you also need Node.js V18+.

## How to use

Create a configuration file by making a copy of the provided template:

```sh
cp .env-template .env
```

Open .env and fill in your [Yle api credentials][yle api credentials].

Start the service by running:

```sh
docker-compose up -d
```

The api is available under the port specified in the configuration file (3100 by default).

## Available endpoints

### `GET /v1/{pageNumber}/{subpageNumber}.png?time=<unixEpochSeconds>`

Returns the latest png image of the requested page / subpage available at the specified time.

Example: If there are two versions of the same page:

* version 1 dated 2023-06-17t15:00
* version 2 dated 2023-06-17t15:10

Querying with 2023-06-17t15:03 would return version 1 since it was the latest available version at that time.

Querying with 2023-06-17t15:15 (or any timestamp in the future) would return version 2.

Querying with 2023-06-17t14:00 would return a HTTP 404 since there doesn't exist such an early snapshot.

The time should be specified as a unix epoch timestamp. For example:

http://localhost:3100/v1/100/1.png?time=1718722380 

### `POST /v1/update`

Takes a snapshot of all teletext pages. A manual trigger for the scheduled update job.

## Local development outside of Docker

Run `docker-compose up -d db` to start just the database. Port 5435 is exposed for accessing the databases.

Run `npm run start:dev` to start the api in watch mode.

## Technical overview

This project was built with the following technologies:

* Node.js and TypeScript
* Express
* PostgreSql
* Docker and Docker-compose

### Notes on the chosen technologies

I chose PostgreSQL mostly because it's a good all-around solution for most database needs. However, in this particular case a document database would work just as well since the data we're storing has no relations whatsoever.

### Things I would do differently in a real-world situation

(See also my to-do's below.)

I would refactor scheduled jobs (i.e. teletext page update) into a separate service / cloud function. The api would just take care of handling the requests and the jobs could be triggered by a separate scheduler. This way we could fire up the CPU only when needed which may introduce significant savings in operating costs.

## TO DO

- [ ] Remove the logic for parsing page numbers out of directory pages and rely on each page's `nextpg` value instead, i.e. walk through all the pages starting from the first known one.
- [ ] tests
- [ ] Refactor modules to have some kind of dependency management and not relying on singleton imports
- [ ] Optimize Docker image size (e.g. fix migrations to run without TypeScript)
- [ ] Configurable rate limiting for Yle api requests

[yle teletext api]: https://developer.yle.fi/tutorial-get-teletext-images/index.html
[yle api credentials]: https://tunnus.yle.fi/api-avaimet
