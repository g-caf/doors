# Guest Check-in System API Documentation

## Overview
RESTful API for a guest check-in system with employee management, activity logging, and notification features.

**Base URL:** `http://localhost:3001/api`
**Authentication:** Bearer JWT tokens for protected routes

## Table of Contents
- [Authentication](#authentication)
- [Employees](#employees)
- [Activity Logs](#activity-logs)
- [Notifications](#notifications)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

### POST `/auth/register`
Create a new user account (admin only in production).

**Request Body:**
```json
{
  "username": "string (min: 3 chars)",
  "password": "string (min: 6 chars)",
  "role": "admin | employee (default: employee)"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  },
  "token": "jwt_token_here"
}
```

### POST `/auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  },
  "token": "jwt_token_here"
}
```

### GET `/auth/profile` 🔒
Get current user profile (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### PUT `/auth/change-password` 🔒
Change user password (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (min: 6 chars)"
}
```

## Employees

### GET `/employees`
Get all employees with optional filtering and pagination.

**Query Parameters:**
- `department`: Filter by department
- `active`: Filter by active status (true/false)
- `search`: Search in name, email, department, position
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "employees": [
    {
      "id": 1,
      "name": "John Smith",
      "department": "Engineering",
      "position": "Senior Developer",
      "email": "john.smith@company.com",
      "phone": "+1-555-0101",
      "photo": "/uploads/employee-123.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

### GET `/employees/:id`
Get employee by ID.

**Response:**
```json
{
  "id": 1,
  "name": "John Smith",
  "department": "Engineering",
  "position": "Senior Developer",
  "email": "john.smith@company.com",
  "phone": "+1-555-0101",
  "photo": "/uploads/employee-123.jpg",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

### GET `/employees/departments`
Get all departments with employee counts.

**Response:**
```json
[
  {
    "department": "Engineering",
    "count": 15
  },
  {
    "department": "Marketing",
    "count": 8
  }
]
```

### POST `/employees` 🔒👑
Create new employee (admin only).

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name`: string (required)
- `department`: string (required)
- `position`: string (required)
- `email`: string (required, unique)
- `phone`: string (optional)
- `isActive`: boolean (default: true)
- `photo`: file (optional, max 5MB, images only)

**Response:**
```json
{
  "message": "Employee created successfully",
  "employee": { /* employee object */ }
}
```

### PUT `/employees/:id` 🔒👑
Update employee (admin only).

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:** All fields from POST are optional for updates.

**Response:**
```json
{
  "message": "Employee updated successfully",
  "employee": { /* updated employee object */ }
}
```

### DELETE `/employees/:id` 🔒👑
Delete employee (admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Employee deleted successfully"
}
```

## Activity Logs

### GET `/activity` 🔒
Get all activity logs with filtering and pagination (authenticated users only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `employeeId`: Filter by employee ID
- `date`: Filter by date (YYYY-MM-DD)
- `status`: Filter by status (checked_in | checked_out)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "employeeId": 1,
      "employeeName": "John Smith",
      "department": "Engineering",
      "position": "Senior Developer",
      "guestName": "Jane Doe",
      "guestPhone": "+1-555-9999",
      "guestEmail": "jane@example.com",
      "purpose": "Meeting about project requirements",
      "checkInTime": "2024-01-01T14:30:00Z",
      "checkOutTime": "2024-01-01T15:30:00Z",
      "notes": "Meeting completed successfully",
      "createdAt": "2024-01-01T14:30:00Z",
      "status": "checked_out"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 200
  }
}
```

### POST `/activity`
Create new check-in record (public endpoint for guest check-in).

**Request Body:**
```json
{
  "employeeId": 1,
  "guestName": "Jane Doe",
  "guestPhone": "+1-555-9999",
  "guestEmail": "jane@example.com",
  "purpose": "Meeting about project requirements",
  "notes": "Optional additional notes"
}
```

**Response:**
```json
{
  "message": "Check-in recorded successfully",
  "log": { /* activity log object */ }
}
```

### PUT `/activity/:id/checkout`
Record check-out time (public endpoint).

**Request Body:**
```json
{
  "notes": "Optional checkout notes"
}
```

**Response:**
```json
{
  "message": "Check-out recorded successfully",
  "log": { /* updated activity log object */ }
}
```

### GET `/activity/stats` 🔒
Get activity statistics (authenticated users only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: Number of days to include in stats (default: 7)

**Response:**
```json
{
  "summary": {
    "todayVisitors": 15,
    "activeVisitors": 3,
    "periodVisitors": 89,
    "averageVisitMinutes": 45
  },
  "dailyStats": [
    {
      "date": "2024-01-01",
      "visitors": 15,
      "completed_visits": 12
    }
  ],
  "departmentStats": [
    {
      "department": "Engineering",
      "visitor_count": 25
    }
  ],
  "period": 7
}
```

### GET `/activity/employee/:id` 🔒
Get activity logs for specific employee (authenticated users only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (active | completed)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "employee": "John Smith",
  "logs": [ /* array of activity logs */ ],
  "pagination": { /* pagination object */ }
}
```

## Notifications

### POST `/notify`
Send notification to employee about visitor.

**Request Body:**
```json
{
  "type": "email | sms | both",
  "employeeId": 1,
  "guestName": "Jane Doe",
  "guestPhone": "+1-555-9999",
  "guestEmail": "jane@example.com",
  "purpose": "Meeting about project requirements",
  "message": "Optional custom message"
}
```

**Response:**
```json
{
  "message": "Notification sent successfully",
  "employee": {
    "name": "John Smith",
    "email": "john@company.com",
    "phone": "+1-555-0101"
  },
  "results": {
    "email": {
      "success": true,
      "message": "Email sent successfully"
    },
    "sms": {
      "success": true,
      "message": "SMS sent successfully"
    }
  }
}
```

### GET `/notify/settings` 🔒👑
Get notification service settings (admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "email": {
    "enabled": true,
    "host": "smtp.gmail.com",
    "port": "587",
    "secure": false,
    "from": "notifications@company.com"
  },
  "sms": {
    "enabled": false,
    "provider": "Mock SMS Service",
    "note": "SMS service is currently mocked"
  }
}
```

### POST `/notify/test/email` 🔒👑
Test email configuration (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

### POST `/notify/test/sms` 🔒👑
Test SMS configuration (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "phone": "+1-555-9999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test SMS sent successfully"
}
```

### POST `/notify/bulk` 🔒👑
Send bulk notifications (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "employeeIds": [1, 2, 3],
  "type": "email | sms | both",
  "guestName": "Jane Doe",
  "guestPhone": "+1-555-9999",
  "guestEmail": "jane@example.com",
  "purpose": "Emergency evacuation drill",
  "message": "Optional custom message"
}
```

**Response:**
```json
{
  "message": "Bulk notification completed",
  "summary": {
    "totalEmployees": 3,
    "successfulEmails": 2,
    "successfulSMS": 3
  },
  "results": [
    {
      "employeeId": 1,
      "employeeName": "John Smith",
      "email": { "success": true, "message": "Sent" },
      "sms": { "success": true, "message": "Sent" }
    }
  ]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "error": "Employee not found"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Different endpoints have different rate limits:

| Endpoint Type | Window | Max Requests |
|---------------|---------|--------------|
| General API | 15 minutes | 100 |
| Authentication | 15 minutes | 5 |
| File Upload | 1 hour | 10 |
| Notifications | 5 minutes | 10 |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Icons Legend
- 🔒 = Requires authentication
- 👑 = Requires admin role
- 📁 = File upload endpoint
