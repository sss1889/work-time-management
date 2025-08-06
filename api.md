# ZenTime RESTful API Design Document

This document specifies the RESTful API for the ZenTime application, designed to support all functionalities of the front-end client.

## 1. Overview

- **Base URL**: `/api`
- **Authentication**: JWT via `Authorization: Bearer <JWT>` header.
- **Data Format**: `application/json`
- **Roles**:
  - `ADMIN`: Administrator with full access.
  - `USER`: Regular employee with access to their own data.

---

## 2. Authentication (`/auth`)

Endpoints for handling user login and logout.

### `POST /auth/login`

- **Description**: Authenticates a user and returns a JWT.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "xxxxxxxx.yyyyyyy.zzzzzzz",
    "user": {
      "id": "user-2",
      "name": "Taro Yamada",
      "email": "taro@example.com",
      "role": "USER",
      "payType": "HOURLY",
      "payRate": 2000
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  { "error": "Invalid email or password" }
  ```

### `POST /auth/logout`

- **Description**: Logs the user out. This might involve server-side token invalidation.
- **Authentication**: Required.
- **Response (204 No Content)**

---

## 3. User Management (`/users`)

**Note**: All endpoints in this section require `ADMIN` role.

### `GET /users`

- **Description**: Retrieves a list of all users.
- **Response (200 OK)**: `[User]`

### `POST /users`

- **Description**: Creates a new user.
- **Request Body**: `Omit<User, 'id'>`
- **Response (201 Created)**: `User`

### `PUT /users/{id}`

- **Description**: Updates an existing user's information.
- **Path Parameters**:
  - `id` (string): The ID of the user to update.
- **Request Body**: `Partial<User>` (password should be optional).
- **Response (200 OK)**: `User`

### `DELETE /users/{id}`

- **Description**: Deletes a user.
- **Path Parameters**:
  - `id` (string): The ID of the user to delete.
- **Response (204 No Content)**

---

## 4. Attendance (`/attendance`)

Endpoints for managing attendance records.

### `GET /attendance`

- **Description**: Retrieves attendance records for the currently authenticated user.
- **Authentication**: Required.
- **Query Parameters**:
  - `month` (string, optional): Filter records by month, formatted as `YYYY-MM`. If omitted, returns all records.
- **Response (200 OK)**: `[AttendanceRecord]`

### `POST /attendance`

- **Description**: Creates a new attendance record for the currently authenticated user.
- **Authentication**: Required.
- **Request Body**: `Omit<AttendanceRecord, 'id' | 'userId'>`
- **Response (201 Created)**: `AttendanceRecord`

### `PUT /attendance/{id}`

- **Description**: Updates an attendance record. Primarily used by an `ADMIN`.
- **Authentication**: Required (`ADMIN` role).
- **Path Parameters**:
  - `id` (string): The ID of the attendance record to update.
- **Request Body**: `Partial<AttendanceRecord>`
- **Response (200 OK)**: `AttendanceRecord`

---

## 5. Daily Reports (`/reports`)

### `GET /reports`

- **Description**: Retrieves all daily reports from all users, sorted by date descending.
- **Authentication**: Required.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "rec-204",
      "userId": "user-3",
      "date": "2023-10-15",
      "report": "Launched social media campaign. Monitored engagement...",
      "userName": "Hanako Tanaka"
    },
    ...
  ]

  ```

---

## 6. Admin (`/admin`)

Endpoints for administrative dashboards and data aggregation.

**Note**: All endpoints in this section require `ADMIN` role.

### `GET /admin/dashboard`

- **Description**: Retrieves aggregated data for the admin dashboard.
- **Response (200 OK)**:
  ```json
  {
    "totalHours": 150.5,
    "totalSalary": 1250000,
    "activeEmployees": 2,
    "employeeData": [
      { "name": "Taro Yamada", "totalHours": 80.5, "totalSalary": 161000 },
      { "name": "Hanako Tanaka", "totalHours": 70, "totalSalary": 350000 }
    ]
  }
  ```

### `GET /admin/payroll`

- **Description**: Retrieves payroll data for all employees for a specified month.
- **Query Parameters**:
  - `month` (string, required): The month to retrieve data for, formatted as `YYYY-MM`.
- **Response (200 OK)**:
  ```json
  {
    "totalPayroll": 511000,
    "payrollData": [
      {
        "id": "user-2",
        "name": "Taro Yamada",
        "payType": "HOURLY",
        "payRate": 2000,
        "totalHours": 80.5,
        "totalSalary": 161000
      },
      {
        "id": "user-3",
        "name": "Hanako Tanaka",
        "payType": "MONTHLY",
        "payRate": 350000,
        "totalHours": 70,
        "totalSalary": 350000
      }
    ]
  }
  ```
