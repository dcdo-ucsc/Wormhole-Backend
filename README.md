## Requirements

- Node.js v20.10.0
- MongoDB

## Installation

1. npm install in root directory
2. create .env file in root directory
   2a. add **PORT** to .env file
   2b. add **DATABASE_URL** to .env file
   - Copy the connection string from MongoDB and add it to the .env file as shown:
     ```
     DATABASE_URL = mongodb://localhost:27017/crud
     ```
     2c. add **SECRET_KEY** to .env file
   - To generate a key:
     ```
     node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
     ```
3. npm run dev

## Testing

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

## API Endpoints Documentation

### **Create a new session**

> [!IMPORTANT]  
> Front-end should generate `userId` with **uuidv4** to guarantee **uniqueness**
> `userId` should be stored on their device via cookies

This endpoint allows the creation of a new session.

The request should be sent as an HTTP **POST** to the specified URL:

```
http://localhost:9001/api/session/create
```

The request body should be of type **x-www-form-urlencoded** and with the following parameters:

| Parameters |  Type  |               Description                | Required? | Default |
| :--------: | :----: | :--------------------------------------: | :-------: | :-----: |
|   userId   | string | User who created the session (uploading) |    Yes    |   N/A   |
|   expiry   | number | Time before session deletion (in **ms**) |    Yes    |   N/A   |
|  password  | string |         Password for the session         |    No     |   ""    |

Request example using **axios**:

```
import axios from 'axios';
import qs from 'qs';

let data = qs.stringify({
  expiry,
  password
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:9001/api/session/create',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

Upon a successful execution, the endpoint returns a 200 status with a JSON response containing the `sessionId` field.

### **Session Authentication**

This endpoint is used to authenticate a session.

#### Request

The request should be sent as an HTTP **POST** to the specified URL:

```
http://localhost:9001/api/session/auth
```

The request body should be of type **x-www-form-urlencoded** and with the following parameters:

| Parameters |  Type  |            Description             | Required? | Default |
| :--------: | :----: | :--------------------------------: | :-------: | :-----: |
| sessionId  | string | The session ID for authentication. |    Yes    |   N/A   |
|  password  | string |      Password for the session      |    No     |   ""    |

#### Response

Upon a successful execution, the endpoint returns a 200 status with a JSON response containing the `accessToken`.

When a session requires a password but:

1. No password field is provided:
   - **401** error status with a JSON response containing the `error` Forbidden message.
2. Password field is provided, but password is correct or empty:
   - **401** error status with a JSON response containing the `error` Invalid password is sent.

When the password is correct or session has no password, a **404** error status with a JSON response containing the `error`, No files found is sent.

### **Upload a file**

This endpoint allows the user to upload files with a specific session ID. The request should be sent as an HTTP **POST** to the specific URL:

```
http://localhost:9001/api/files/upload/{{sessionId}}
```

The request body should be of type **form-data** and with the following parameters:

| Parameters | Type |      Description       | Required? | Default |
| :--------: | :--: | :--------------------: | :-------: | :-----: |
|    file    | file | File(s) to be uploaded |    Yes    |   N/A   |

Request example using **axios**:

```
import axios from 'axios';
import FormData from 'form-data';

let data = new FormData();
data.append(file);

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:9001/api/files/upload/65d29b525d7f851cb31eb579',
  headers: {
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

Upon successful execution, the endpoint returns a JSON response with a status code of 200 indicating a successful upload.

If the file uploaded exceeds the maximum single file size or the maximum total number of files, the endpoint returns a 413 status.
