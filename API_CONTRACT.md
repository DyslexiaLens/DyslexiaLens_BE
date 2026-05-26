    "result": {
      "imagePath": "uploads/20260516-123456.jpg",
      "predictedText": "Ths is smple txt wth dyslxic ptrn",
      "confidence": 0.85,
      "resultLabel": "LIKELY_DYSLEXIA_PATTERN",
      "notes": "Mock AI response..."
    },
    "history": {
      "id": 1,
      "user_id": 1,
      "image_url": "uploads/20260516-123456.jpg",
      "predicted_text": "Ths is smple txt wth dyslxic ptrn",
      "confidence": 0.85,
      "result_label": "LIKELY_DYSLEXIA_PATTERN",
      "raw_response": "{...}",
      "created_at": "2026-05-16T10:00:00.000Z"
    }

}
}

````

**Error Responses:**

- 400: File not uploaded
- 400: Only image files allowed
- 413: File size exceeds limit
- 401: Unauthorized

---

#### POST /api/v1/ai/translations

Same structure as `/ai/detections` but for translation task.

**Success Response (201):**

```json
{
  "success": true,
  "message": "Translation success",
  "data": {
    "result": {
      "imagePath": "uploads/...",
      "sourceText": "Ths is hndwrttn",
      "translatedText": "This is handwritten",
      "sourceLanguage": "id",
      "targetLanguage": "en",
      "notes": "Mock AI response..."
    },
    "history": {
      "id": 1,
      "user_id": 1,
      "image_url": "uploads/...",
      "source_text": "Ths is hndwrttn",
      "translated_text": "This is handwritten",
      "source_language": "id",
      "target_language": "en",
      "raw_response": "{...}",
      "created_at": "2026-05-16T10:00:00.000Z"
    }
  }
}
````

---

#### POST /api/v1/analysis/predict

Alias of `/api/v1/ai/detections` for the Postman collection and frontend integration.

---

#### POST /api/v1/analysis/translate

Alias of `/api/v1/ai/translations` for the Postman collection and frontend integration.

---

#### POST /api/v1/uploads

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Body:**

```
image: <Binary image file>
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Upload success",
  "data": {
    "imagePath": "uploads/20260516-123456.jpg",
    "fileName": "20260516-123456.jpg"
  }
}
```

---

### 4. History Endpoints

#### GET /api/v1/history

Returns combined detection and translation history list.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Get history success",
  "data": {
    "histories": []
  }
}
```

---

#### GET /api/v1/history/:id

Returns a single history item by ID regardless of type.

---

#### DELETE /api/v1/history/:id

Deletes a single history item by ID regardless of type.

---

#### GET /api/v1/histories/detections

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Get detection histories success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "image_url": "uploads/...",
      "predicted_text": "...",
      "confidence": 0.85,
      "result_label": "LIKELY_DYSLEXIA_PATTERN",
      "raw_response": "{...}",
      "created_at": "2026-05-16T10:00:00.000Z"
    },
    ...
  ]
}
```

---

#### GET /api/v1/histories/translations

Same as `/histories/detections` but for translation history.

---

#### GET /api/v1/histories/:type/:id

**Path Parameters:**

- type: `detection` or `translation`
- id: history record id

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Get history detail success",
  "data": {
    "id": 1,
    "user_id": 1,
    "image_url": "uploads/...",
    "predicted_text": "...",
    "confidence": 0.85,
    "result_label": "LIKELY_DYSLEXIA_PATTERN",
    "raw_response": "{...}",
    "created_at": "2026-05-16T10:00:00.000Z"
  }
}
```

**Error Responses:**

- 404: History not found
- 401: Unauthorized

---

#### DELETE /api/v1/histories/:type/:id

**Path Parameters:**

- type: `detection` or `translation`
- id: history record id

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Delete history success",
  "data": {
    "deleted": true
  }
}
```

**Error Responses:**

- 404: History not found
- 401: Unauthorized

---

### 5. System Endpoint

#### GET /api/v1/health

**Success Response (200):**

```json
{
  "success": true,
  "message": "API healthy",
  "data": {
    "status": "healthy"
  }
}
```

No authentication required. Use for:

- Uptime monitoring
- Load balancer health checks
- CI/CD pipeline verification

---

## Backend Development Best Practices

### 1. Code Organization

**Service Layer Pattern:**

- Services handle business logic, reusable across controllers
- Models handle database queries (data layer)
- Controllers handle HTTP request/response (presentation layer)
- This separation makes testing and refactoring easier

**Example:**

```javascript
// Bad: Logic mixed in controller
app.post('/login', async (req, res) => {
  const user = await db.query('SELECT * FROM users...');
  const valid = await bcrypt.compare(...);
  // 50 lines of business logic here
});

// Good: Logic in service
app.post('/login', asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, 'Login success');
}));
```

### 2. Error Handling

**Use custom HttpError class:**

```javascript
if (!user) {
  throw new HttpError(404, "User not found");
}
```

**Benefits:**

- Consistent error response format
- Central error handler catches all errors
- Prevents crashes from unhandled exceptions

### 3. Validation

**Always validate input:**

```javascript
// In route
router.post(
  "/register",
  registerValidator, // Array of validation rules
  handleValidationResult, // Middleware to check errors
  authController.register,
);
```

**Never trust user input:**

- HTTP method (POST vs GET)
- User ID (use from JWT, not from request)
- File type/size (validate on server, not client)

### 4. Authentication & Authorization

**JWT Token Best Practices:**

- Include only essential claims (userId, email)
- Use appropriate expiry (7-30 days)
- Implement refresh token for long sessions
- Never store sensitive data in token (it's just encoded, not encrypted)

**Authorization:**

- Verify user owns the resource (check userId)
- Check permissions before operation
- Use auth middleware for protected routes

### 5. Database

**Query Optimization:**

- Use indexes on frequently queried columns
- Avoid SELECT \* (specify columns needed)
- Use LIMIT for list endpoints (pagination)
- Use EXPLAIN ANALYZE for slow queries

**Transaction handling:**

```javascript
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(sql1, params1);
  await client.query(sql2, params2);
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
}
```

### 6. File Upload

**Security considerations:**

- Validate MIME type on server
- Check file size limit
- Rename file to random name (prevent directory traversal)
- Scan for malware (future implementation)
- Consider storing in cloud (S3/GCS) instead of local

### 7. Logging & Monitoring

**Use meaningful logs:**

```javascript
console.log("User registered:", userId, email);
console.error("Database query failed:", error.message);
```

**Never log:**

- Passwords
- Tokens
- Sensitive personal data

**For production:**

- Use structured logging (Winston/Bunyan)
- Send logs to centralized service
- Set appropriate log levels (info, warn, error)

### 8. Testing Strategy

**Test layers:**

1. Unit: Test services in isolation
2. Integration: Test controller + service + database
3. End-to-end: Test full flow via API

**Example test:**

```javascript
describe("Auth Service", () => {
  it("should register new user", async () => {
    const result = await authService.register({
      fullName: "Test User",
      email: "test@mail.com",
      password: "Password123",
    });
    expect(result).toHaveProperty("id");
  });
});
```

### 9. Performance

**Optimization checklist:**

- [ ] Database queries use indexes
- [ ] Add caching layer (Redis) for frequent queries
- [ ] Implement pagination on list endpoints
- [ ] Compress responses (gzip middleware)
- [ ] Use connection pooling for database
- [ ] Monitor slow queries
- [ ] Profile memory usage

### 10. Security

**Security checklist:**

- [ ] Validate & sanitize all input
- [ ] Use HTTPS (enforce in production)
- [ ] Implement rate limiting on auth endpoints
- [ ] Hash passwords (bcrypt: done)
- [ ] Secure JWT secret (change on deploy)
- [ ] CORS: restrict to frontend domain
- [ ] SQL injection: use parameterized queries (done via pg)
- [ ] XSS: validate input (done via express-validator)
- [ ] CSRF: implement if using cookies
- [ ] Keep dependencies updated

---

## Code Review Checklist

Before merging code:

- [ ] Passes `npm run lint`
- [ ] Has proper error handling
- [ ] Input is validated
- [ ] Database queries are optimized
- [ ] No hardcoded secrets
- [ ] No console.log in production code
- [ ] Unit tests pass (if applicable)
- [ ] API response format is consistent
- [ ] Documentation is updated

---

Last Updated: May 16, 2026
