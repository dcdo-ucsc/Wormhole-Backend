<!-- ------------------------------------------------------ -->

# **`User`** endpoints

<!-- ------------------------------------------------------ -->

## **`GET`** /api/user/generate

Generates a new user ID.

### Cookies

- `uuid` (optional): Checks if user already has a `userId` stored.

### Responses

- `200 OK`: The user ID was generated successfully or user already has `userId`.

<!-- ------------------------------------------------------ -->

# **`Session`** endpoints

<!-- ------------------------------------------------------ -->

## **`POST`** /api/session/create

> [!IMPORTANT]  
> Front-end should generate `userId` with **uuidv4** to guarantee **uniqueness** > `userId` should be stored on their device via cookies (or other means).

> [!IMPORTANT]  
> The `accessToken` here is only for the session owner. It is used to upload files. They don't need to authenticate with /api/session/auth.

Creates a new session.

### Cookies

- `userId` : Used to check if user is session owner.

### Request Body

Type of request body: **x-www-form-urlencoded**

| Parameters |  Type  |               Description                | Required? | Default |
| :--------: | :----: | :--------------------------------------: | :-------: | :-----: |
|   expiry   | number | Time before session deletion (in **ms**) |    Yes    |   N/A   |
|  password  | string |         Password for the session         |    No     |   ""    |

### Responses

- `200 OK`: The session was created successfully.
Also sets a cookie with the `accessToken` for the user linked to the sessionId.

```
{
  "sessionId": "65e01380b8c0cc733321e5b2"
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NWU"
}
```


- `500 Internal Server Error`: An error occurred while creating the session.

### `Session Create` Request Example

<details>
<summary>Show Code</summary>

```javascript
import axios from "axios";
import qs from "qs";

let data = qs.stringify({
  expiry: "60000",
  password: "123",
  userId: "8176788d-3838-4d22-b312-5e4fbd5f051c",
});

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "http://localhost:9001/api/session/create",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  data: data,
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```

</details>
<!-- ------------------------------------------------------ -->

## **`POST`** /api/session/auth

> [!IMPORTANT]  
> This is only used every user other than the session owner. Only used for downloading files.

Authenticates a user for session access.

### Request Body

Type of request body: **x-www-form-urlencoded**

| Parameters |  Type  |          Description           | Required? | Default |
| :--------: | :----: | :----------------------------: | :-------: | :-----: |
| sessionId  | string | Session ID for authentication. |    Yes    |   N/A   |
|  password  | string |    Password for the session    |    No     |   ""    |

### Responses

- `200 OK`: User was authenticated successfully.
  Sets a cookie with the `accessToken` for the user linked to the sessionId.

```
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NWU"
}
```

- `400 Bad Request`: Invalid `sessionId` format (uuidv4).
- `400 Bad Request`: Session not found.

When a session requires a password but:

1. No password field is provided, but session requires a password:
   - `401 Unauthorized`: Forbidden message.
2. Password field is provided, but password is correct or empty:
   - `401 Unauthorized`: Invalid password.

- `404 Not Found`: No files found.

### `Auth` Request Example

<details>
<summary>Show Code</summary>

```javascript
import axios from "axios";
import qs from "qs";

let data = qs.stringify({
  password: "123",
  sessionId: "65e01380b8c0cc733321e5b2",
});

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "http://localhost:9001/api/session/auth",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  data: data,
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```

</details>
<!-- ------------------------------------------------------ -->

# **`File`** endpoints

<!-- ------------------------------------------------------ -->

## **`POST`** /api/files/upload

Upload files to a specified session.

### Parameters

- `fileCount` (query): The number of files being uploaded.

### Headers

- `Authorization`: The `accessToken` obtained from `/api/session/auth` or `/api/session/create`.

### Request Body

Type of request body: **form-data**

| Parameters | Type |      Description       | Required? | Default |
| :--------: | :--: | :--------------------: | :-------: | :-----: |
|    file    | file | File(s) to be uploaded |    Yes    |   N/A   |

### Responses

- `200 OK`: The file was uploaded successfully.
- `400 Bad Request`: Invalid `userId` format (uuidv4).
- `401 Unauthorized`: Expired / missing / Unauthorized accessToken.
- `413 Payload Too Large`: The file is too large.
- `413 Payload Too Large`: Number of files in session exceeds the limit.

### `Upload` Request Example

<details>
<summary>Show Code</summary>

```javascript
import axios from "axios";
import qs from "qs";
import fs from "fs";
import FormData from "form-data";

let data = new FormData();
data.append(
  "file",
  fs.createReadStream("/C:/Users/Dev/Downloads/test files/test.txt")
);

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "http://localhost:9001/api/files/upload?fileCount=1",
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NWUwMTM4MGI4YzBjYzczMzMyMWU1YjIiLCJ1c2VySWQiOiI4MTc2Nzg4ZC0zODM4LTRkMjItYjMxMi01ZTRmYmQ1ZjA1MWMiLCJpYXQiOjE3MDkxODM4NzJ9.TABPtQ6IWMTG7AO4HTNRXSvxaViqWk-gfyXUoxxy9-g",
    ...data.getHeaders(),
  },
  data: data,
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```

</details>
<!-- ------------------------------------------------------ -->

## **`GET`** /api/files/download

Download files from specified session.

### Parameters

- `sessionId` (query): The session ID to download files from.

### Headers

- `Authorization`: The `accessToken` obtained from `/api/session/auth` or `/api/session/create`.

### Responses

Just like the `GET` request, the response will be the file itself.

- `401 Unauthorized`: Expired / missing / Unauthorized accessToken.

### `Download` Request Example

<details>
<summary>Show Code</summary>

```javascript
import axios from "axios";
import qs from "qs";

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "http://localhost:9001/api/files/download/65e02cdedf0cfc1310e0b26f",
  headers: {},
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```

<!-- ------------------------------------------------------ -->
