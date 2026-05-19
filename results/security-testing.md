# Security Testing

| Test ID | Module | Test Case | Expected Result | Actual Result | Status | Fix Implemented (If Any) |
|---|---|---|---|---|---|---|
| ST-01 | Authentication | SQL injection in login form | Injection blocked | Login secure | PASS | Used parameterized queries |
| ST-02 | Authentication | Password stored securely | Hash stored instead of plaintext | Encrypted successfully | PASS | Implemented bcrypt |
| ST-03 | Sessions | Access dashboard without login | Redirect to login | Unauthorized access blocked | PASS | Added session middleware |
| ST-04 | Roles | Staff accesses admin page | Access denied | Permission blocked | PASS | Added role middleware |
| ST-05 | Roles | Hospital admin accesses user management | Access denied | Restricted correctly | PASS | Added role validation |
| ST-06 | Forms | XSS attempt in patient name | Script blocked | Input sanitized | PASS | Added validation |
| ST-07 | Database | Direct SQL manipulation attempt | Query rejected | Database protected | PASS | Prepared statements used |
| ST-08 | User Accounts | Disabled user attempts login | Login denied | Access blocked | PASS | Added is_active validation |
| ST-09 | Routes | Unauthorized export access | Access denied | Protected correctly | PASS | Middleware added |
| ST-10 | Sessions | Logout destroys session | Session removed | User fully logged out | PASS | Session destroy implemented |


