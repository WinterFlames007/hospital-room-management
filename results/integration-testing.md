# Integration Testing

| Test ID | Module | Test Case | Expected Result | Actual Result | Status | Fix Implemented (If Any) |
|---|---|---|---|---|---|---|
| IT-01 | Patients + Assignments | Assign patient after creation | Assignment succeeds | Patient linked to room | PASS | None |
| IT-02 | Rooms + Assignments | Assign patient updates room occupancy | Occupancy increases | Beds reduced correctly | PASS | Added occupancy updates |
| IT-03 | Assignments + Rooms | Full room becomes occupied | Status changes to occupied | Room marked occupied | PASS | Added room status update |
| IT-04 | Assignments + Rooms | Discharge patient frees bed | Bed count increases | Room availability restored | PASS | Added discharge update logic |
| IT-05 | Authentication + Dashboard | Login redirects to dashboard | Dashboard accessible | Redirect successful | PASS | None |
| IT-06 | Notifications + Activities | Creating patient triggers activity and notification | Both created | Feed updated correctly | PASS | None |
| IT-07 | Search + Database | Global search across modules | Results returned from all modules | Search working correctly | PASS | Added multi-query search |
| IT-08 | Reports + Database | Export pulls latest records | Export contains current data | Export accurate | PASS | None |
| IT-09 | User Management + Authentication | Disabled user login blocked | Access denied | Disabled account prevented | PASS | Added account status validation |
| IT-10 | Dashboard + Activity Feed | New activities appear on dashboard | Feed auto-updates | Activity feed updated | PASS | Added live refresh |
