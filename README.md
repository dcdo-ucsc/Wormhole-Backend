## Table of Contents

- [API Endpoint Documentation](API_DOCS.md)
- [Requirements](#requirements)
- [Installation](#installation)
- [Testing](#testing)

## Requirements

- [Node.js v20.10.0](https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi)
- [MongoDB](https://www.mongodb.com/try/download/community)

## Installation

1. `npm install` in root directory
2. create `.env` file in root directory
   2a. add **PORT** to .env file
   2b. add **DATABASE_URL** to .env file
   - Copy the connection string from MongoDB and add it to the .env file as shown:
     ```
     DATABASE_URL = mongodb://localhost:27017/
     ```
     2c. add **SECRET_KEY** to .env file
   - To generate a key:
     ```
     node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
     ```
3. `npm run dev`

## Testing (kinda outdated)

[Postman](https://www.postman.com/downloads/) for testing API endpoints

**1. Create an environment in Postman**

Add the following variables to the environment with default type & no values:

- 'sessionId'

Save the environment, and set it as the active environment.

**2. Adding requests to test**

Create a new collection in Postman, and add the following requests to test the API endpoints.

Add a new request to the collection, and set the request type to **POST** with the following URL:

```
{your_server_url}/api/session/create
```

Go to the **Body** tab, and select **x-www-form-urlencoded**. Add the following keys with their respective values:

```
expiry
password
```

Go over to **Tests** tab, and add the following code:

```
let res = pm.response.json()

let sessionId = res.sessionId;

pm.environment.set("sessionId", sessionId);
```

Add another request called 'upload', and set the request type to **POST** with the following URL:

```
{your_server_url}/api/files/upload/{{sessionId}}
```

Go to the **Body** tab, and select **form-data**. Add their respective keys with their respective values.

