# Circuits Touristiques

Management system for a travel agency that sells guided tours of historic monuments. Agents create and manage the tours. Clients sign up for them and pay online.

This was a class project done over 2 sprints by a team of 4. It follows the case study given by our professor.

## Features

**Agents**
* Create, edit and delete monuments and tours
* Assign monuments, a driver and a guide to a tour
* Read client reviews

**Clients**
* Create an account and log in
* Browse the tours
* Sign up for a tour and pay with PayPal
* Rate a tour with a score and a comment

## Project structure

| Folder | Description | Stack | Port |
| --- | --- | --- | --- |
| `server/` | REST API that links both apps to the database | Node.js 22, Express 5, MySQL | 3000 |
| `web-client/` | Website for clients | React 19, Vite, PayPal | 8000 |
| `agent-app/` | Desktop app for agents | React 19, Vite, Electron | 8080 |
| `UML/` | Diagrams and mockups from the analysis | | |

## Documents

* [Etude de cas.pdf](Etude%20de%20cas.pdf) is the case study from our professor (French)
* [Tasks.pdf](Tasks.pdf) holds our user stories and sprint tasks (French)
* [Plan de test.pdf](Plan%20de%20test.pdf) is our test plan (French)

## Requirements

* Node.js 22
* A MySQL database

## Setup

### Server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Fill in `server/.env` before starting.

| Variable | Description |
| --- | --- |
| `PORT` | API port (default 3000) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Long random string used to sign tokens |
| `PAYPAL_CLIENT_ID` `PAYPAL_CLIENT_SECRET` | PayPal sandbox keys (optional) |

The server stops if a required variable is missing. On startup it creates the tables and adds sample data when they are empty.

### Web client

```bash
cd web-client
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to the API address. Set `VITE_PAYPAL_CLIENT_ID` to turn on payment.

### Agent app

```bash
cd agent-app
npm install
cp .env.example .env
npm run dev
```

This starts Vite and opens the Electron window. Set `VITE_API_URL` to the API address.

## Azure

We were required to store our data on Azure. The server runs on Azure App Service with MySQL In App. When `MYSQLCONNSTR_localdb` is set by Azure the server uses it and the `DB_*` variables are not needed. Only `JWT_SECRET` is required then.

## Test accounts

These are created in an empty database.

| Email | Password |
| --- | --- |
| `alice@example.com` | `pass1234` |
| `bob@example.com` | `motdepasse` |
| `carol@example.com` | `secret99` |

## API

All routes start with `/api`.

| Resource | Routes |
| --- | --- |
| Users | `POST /users/connexion` `POST /users/inscription` |
| Monuments | `GET /monuments` `GET /monuments/:id` `POST /monuments` `PATCH /monuments/:id` `DELETE /monuments/:id` |
| Tours | `GET /circuits` `GET /circuits/:id` `GET /circuits/subscribed`\* `POST /circuits` `PATCH /circuits/:id` `DELETE /circuits/:id` |
| Guides | `GET /guides` `POST /guides` `DELETE /guides/:id` `POST /circuits/:id/guide` `DELETE /circuits/:id/guide` |
| Reviews | `GET /evaluations` `POST /evaluations`\* `DELETE /evaluations/:id` |
| PayPal | `POST /create-order` `POST /capture-order/:orderId`\* |

\* Needs a JWT in the `Authorization` header.

## Tests

```bash
cd web-client && npx vitest --run
cd agent-app && npx vitest --run
```

GitHub Actions runs the tests on every push to `main` and on every pull request.

## Team

* [Antoine](https://github.com/ANTOINEJUTEAU)
* [Charles](https://github.com/corrupted-wolf)
* [Safet](https://github.com/SafetKarisik)
* [Viken](https://github.com/Vikmanou)