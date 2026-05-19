# Unit Testing

| Test ID | Module | Test Case | Expected Result | Actual Result | Status | Fix Implemented (If Any) |
|---|---|---|---|---|---|---|
| UT-01 | Authentication | Login with valid credentials | User redirected to dashboard | User logged in successfully | PASS | None | 
| UT-02 | Authentication | Login with invalid password | Error message displayed | Invalid password blocked | PASS | Added bcrypt validation |
| UT-03 | Authentication | Login with disabled account | Login denied | Account disabled message shown | PASS | Added is_active validation |
| UT-04 | Authentication | Logout user | Session destroyed | User logged out successfully | PASS | Added online status update |
| UT-05 | Authentication | Password hashing during registration | Password encrypted in DB | Password stored as hash | PASS | Implemented bcrypt |
| UT-06 | Patients | Add patient with valid data | Patient created | Patient saved successfully | PASS | None |
| UT-07 | Patients | Add patient with missing fields | Validation error | Form prevented invalid insert | PASS | Added required validation |
| UT-08 | Patients | Add high priority patient | Activity + notification created | High priority alert triggered | PASS | Added activity logging |
| UT-09 | Rooms | Add room successfully | Room created | Room stored in database | PASS | None |
| UT-10 | Rooms | Duplicate room number | Duplicate prevented | Insert blocked | PASS | Added duplicate room validation |
| UT-11 | Rooms | Room capacity calculation | Available beds initialized | Beds correctly assigned | PASS | Added occupancy logic |
| UT-12 | Assignments | Assign patient to room | Assignment created | Assignment saved | PASS | None |
| UT-13 | Assignments | Assign patient to full room | Assignment denied | Full room blocked | PASS | Added bed availability validation |
| UT-14 | Assignments | Discharge patient | Assignment completed | Status updated correctly | PASS | Added discharge logic |
| UT-15 | Assignments | Transfer patient | Room updated successfully | Transfer completed | PASS | Added transfer functionality |
| UT-16 | Notifications | Create notification | Notification stored | Notification displayed | PASS | None |
| UT-17 | Activity Logs | Create activity | Activity saved | Activity feed updated | PASS | None |
| UT-18 | Dashboard | Load dashboard statistics | Statistics displayed | Dashboard loaded correctly | PASS | None |
| UT-19 | Search | Global search query | Results returned | Search working correctly | PASS | Added live search route |
| UT-20 | Reports | Export patient report | CSV downloaded | Export successful | PASS | None |
