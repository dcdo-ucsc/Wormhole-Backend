<!-- ------------------------------------------------------ -->

# **`User`** endpoints

<!-- ------------------------------------------------------ -->

## **`GET`** /api/user/generate

Generates a new user ID.

### Cookies

- `uuid` (optional): Checks if user already has a `userId` stored.

### Responses

- `200 OK`: The user ID was generated successfully or user already has `userId`.

## **`GET`** /api/user/fetchRole

Fetches the role of a user.

### Cookies

- `sessionToken`: Used to check if user is `owner` or `user`

### Responses

- `200 OK`: `userRole` string `owner` or `user`

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
- `500 Internal Server Error`: An error occurred while creating the session.

```
{
  "sessionId": "65e01380b8c0cc733321e5b2"
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2NWU"
  "deletionTime": 1710304943103
}
```
### `Session Create` Request Example

<details>
<summary>Show Code</summary>

```javascript
import axios from "axios";
import qs from "qs";

const createSession = async (expiry, password) => {
  let data = qs.stringify({
    expiry,
    password,
  });

  const res = await axios.post(backend + "/api/session/create", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.data;
};
```

</details>
<!-- ------------------------------------------------------ -->

## **`GET`** /api/session/data/:sessionId

Gets the necessary data for the session. Returns the QR Code, deletionTime, sessionId

### Parameters

- `sessionId` (query): sessionId of the session

### Responses

- `200 OK`: Session exists, returns necessary data of session

```
{
  "sessionId": "65e01380b8c0cc733321e5b2"
  "qrCodeDataURL": "data:image/png;base64,idk"
  "deletionTime": 1710304943103
}
```

- `404 Bad Request`: Session not found.
- `500 Internal Error`: Unable to generate QR Code, other internal errors.

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

const authSession = async (sessionId, password) => {
  let data = qs.stringify({
    sessionId,
    password,
  });
  const res = await axios.post(backend + "/api/session/auth", data, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
};
```

</details>
<!-- ------------------------------------------------------ -->

## **`GET`** /api/session/getFileNames/:sessionId

Returns all file names of the session

### Parameters

- `sessionId` (query): sessionId of the session

### Responses

- `200 OK`: Returns the file names in the session

```
{
  "fileNames": [String]
}
```

- `404 Bad Request`: No files in session
- `404 Bad Request`: Session not found

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
import axios from 'axios';
import FormData from 'form-data';

const uploadFiles = async (files, sessionToken, fileCount) => {
  let formData = new FormData();
  files.forEach((file) => {
    formData.append('file', file);
  });

  const res = await axios.post(backend + `/api/files/upload`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${sessionToken}`,
    },
    params: {
      fileCount,
    },
  });
  return res.data;
};
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

const res = await axios.get(backend + `/api/files/download`, {
    responseType: 'blob',
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    params: {
      sessionId,
    },
  });
  return res;
});
```

<!-- ------------------------------------------------------ -->
