# News Aggregator API

This Node.js Express application functions as a RESTful API for news aggregation, integrating external APIs while ensuring input validation through the use of the express-validator library. The API offers a range of features, including user management (creation and authentication), news aggregation based on user preferences, and the ability for users to mark news articles as favorites or as read.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Validation](#validation)
- [Endpoints](#endpoints)

## Features

- User Management: Users can create accounts and authenticate securely.
- News Aggregation: External news APIs are aggregated and served according to user preferences.
- User Interactions: Users can mark news articles as favorites or mark them as read.
- Real-time API Scheduling: A background task scheduler ensures real-time data updates.
- Caching: Data fetched from APIs is cached using node-cache for optimized performance.
- Role-Based Access Control (RBAC): Admin users are granted exclusive access to run scheduled tasks.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.
- Node version 18 or above

## Installation

1. Clone this repository

```bash
git clone https://github.com/vazanth/news-aggregator-api.git
```

2. Install dependencies

```bash
npm install
```

3. Run Server

```bash
npm run dev
```

# Usage

You can browse the apis at <http://localhost:3000> using either in postman or curl or any api platform

# Validation

This project uses the express-validator library for input validation. Validation schemas are defined in the helpers/validator.js file and are used to validate incoming requests.

# Endpoints

|                      Endpoint | Description                                                                     | Payload               |
| ----------------------------: | :------------------------------------------------------------------------------ | :-------------------- |
|    `POST /api/users/sign-up ` | Register a new user.                                                            | [sign-up](#sign-up)   |
|     `POST /api/users/sign-in` | Log in a user.                                                                  | [sign-in](#sign-in)   |
|    `POST /api/users/sign-out` | Logout a user                                                                   |                       |
|  `GET /api/users/preferences` | Retrieve the news preferences for the logged-in user.                           |                       |
|  `PUT /api/users/preferences` | Update the news preferences for the logged-in user.                             | [upd-pref](#upd-pref) |
|               `GET /api/news` | Fetch news articles based on the logged-in user's preferences.                  |                       |
|          `GET /api/news/read` | Fecth news areticles that are read by the user                                  |                       |
|      `GET /api/news/favorite` | Fecth news areticles that are marker as favorite by the user                    |                       |
| `GET /api/news/top-headlines` | Fetch top-news articles based on the logged-in user's preferences.              |                       |
|      `POST /api/:newsId/read` | Mark a article as read for a user                                               |                       |
|  `POST /api/:newsId/favorite` | Mark a article as favorite for a user                                           |                       |
|    `POST /api/schedule/start` | Start the schedule for fetching news api for logged-in user only by admin users | [schedule](#schedule) |
|     `POST /api/schedule/stop` | stop the schedule for fetching news api for logged-in user only by admin users  |                       |

## Payload Sample

# sign-up

```bash
  {
    "fullname": "adminuser",
    "email": "admin@gmail.com",
    "password": "Test12@4",
    "confirmPassword": "Test12@4",
    "role": "admin",
    "preferences": {
        "categories": ["technology"],
        "sources": ["abc-news", "bbc-news"]
    }
  }
```

# sign-in

```bash
  {
    "email": "admin@gmail.com",
    "password": "Test12@4"
}
```

# upd-pref

```bash
  {
    "categories": [
        "technology"
    ],
    "sources": [
        "abc-news",
        "bbc-news"
    ]
  }
```

# schedule

```bash
  {
    "scheduleType": "hourly",
    "scheduleValue": 1
}
```
