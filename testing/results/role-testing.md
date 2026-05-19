# Role Testing

| Test ID | Module | Test Case | Expected Result | Actual Result | Status | Fix Implemented (If Any) |
|---|---|---|---|---|---|---|
| RL-01 | Staff | Access patients page | Access allowed | Successful | PASS | None |
| RL-02 | Staff | Create patient | Access allowed | Successful | PASS | None |
| RL-03 | Staff | Create room | Access denied | Blocked correctly | PASS | Role middleware |
| RL-04 | Staff | Access reports | Access denied | Blocked correctly | PASS | Route protection |
| RL-05 | Hospital Admin | Create room | Access allowed | Successful | PASS | None |
| RL-06 | Hospital Admin | Delete room | Access allowed | Successful | PASS | None |
| RL-07 | Hospital Admin | Access user management | Access denied | Restricted correctly | PASS | Added admin-only access |
| RL-08 | Admin | Access all modules | Full access granted | Successful | PASS | None |
| RL-09 | Admin | Deactivate user | User disabled | Successful | PASS | Added toggle status |
| RL-10 | Disabled User | Attempt login | Access denied | Blocked correctly | PASS | Added active check |