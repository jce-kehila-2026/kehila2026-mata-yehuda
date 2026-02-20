## Risk Table

| #  | Description / Impact                                   | Prob (%) | Impact (L, M, H, VH) | Risk Code | Mitigation Plan / Contingency Plan                                | Status (to be checked periodically) |
|----|------------------------------------------------------|----------|----------------------|-----------|----------------------------------------------------------------|------------------------------------|
| 1 | Payment integration failure may block registrations | 40 | High | R1 | Early sandbox testing with payment API, fallback message, retry option | Open |
| 2 | Overbooking due to capacity bug | 35 | High | R2 | Server-side capacity validation and atomic seat update | Open |
| 3 | Requirements changes after feedback | 30 | Medium | R3 | Freeze scope after review and update wiki consistently | Open |
| 4 | Security vulnerability (admin or payment data) | 25 | Very High | R4 | Use HTTPS, secure sessions, input validation, CSRF protection | Open |
| 5 | Data loss of registrations | 20 | High | R5 | Daily database backups and audit log | Open |
| 6 | Team member time constraints | 50 | Medium | R6 | Divide tasks clearly and set weekly milestones | Open |
| 7 | WhatsApp API failure may prevent sending confirmations or reminders | 30 | Medium | R7 | Implement retry mechanism and message status logging; allow manual resend | Open |
| 8 | Incorrect statistics due to data inconsistency | 25 | Medium | R8 | Validate data queries, use tested aggregation logic, and verify with sample datasets | Open |
## Monitoring & Review

- **Weekly** review of high-risk items  
- **Monthly** review of medium-risk items  
- **Immediate** review upon incident occurrence


