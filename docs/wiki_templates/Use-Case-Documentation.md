## System Actors

1. **Visitor / Participant** – A user who browses activities and registers for events without creating an account.

2. **Admin (Staff Member)** – A staff member of the association who manages activities and registrations.

3. **External Payment System** – A third-party payment service that processes online payments for paid activities.

4. **DB** - External Data Storage Service

5. **WhatsApp API** – External messaging service for sending confirmations / reminders / updates.


## Use-Case UML

The system includes the following main use cases:

Participant / Registered User:
- View Activities / View Monthly Calendar
- View Activity Details
- Register for Activity
- Pay by Credit Card
Admin (Staff Member):
- Staff Login
- Manage Activities
- View Activity Registrations
- Check Attendance
- View Statistics
- Send Notification (via WhatsApp)
  
<img src="../images/use-case-diagram.jpeg" width="600">

## UC1 – View Monthly Calendar

**Primary Actor:** Visitor  
**Preconditions:** The website is available.  
**Postconditions:** The monthly calendar is displayed.

### Basic Flow:
1. The user opens the Calendar page.
2. The system displays the current month with marked activities.
3. The user may navigate to another month.

### Exception Flows:
- If there are no activities in the selected month, the system displays a "No activities available" message.
  
## UC2 – View Activity Details

**Primary Actor:** Visitor  
**Preconditions:** The selected activity exists.  
**Postconditions:** The activity details page is displayed.

### Basic Flow:
1. The user selects an activity.
2. The system displays full activity details including date, location, description, price, and capacity.
3. The user may choose to register.

### Exception Flows:
- If the activity no longer exists, the system displays an error message.

## UC3 – Register for Activity

**Primary Actor:** Visitor  
**Preconditions:** Registration is open and the activity is not full.  
**Postconditions:** A registration record is created.

### Basic Flow:
1. The user clicks "Register".
2. The system displays a registration form.
3. The user fills in personal details and submits the form.
4. The system validates the input.
5. The system creates a registration record.
6. If the activity requires payment, the system proceeds to payment.

### Exception Flows:
- If required fields are missing, the system displays validation errors.
- If the activity is full, the system displays a "Registration closed" message.

## UC4 – Pay by Credit Card

**Primary Actor:** Visitor  
**Supporting Actor:** External Payment System  
**Preconditions:** A pending registration exists.  
**Postconditions:** Payment status is updated.

### Basic Flow:
1. The system redirects the user to the external payment service.
2. The user enters credit card details.
3. The payment service processes the transaction.
4. The payment result is returned to the system.
5. The system updates the registration status accordingly.

### Exception Flows:
- If payment fails, the system displays an error message.
- If the payment service is unavailable, the system asks the user to try again later.

## UC5 – Manage Activities

**Primary Actor:** Admin  
**Preconditions:** The admin is authorized.  
**Postconditions:** Activities are updated in the system.

### Basic Flow:
1. The admin opens the management panel.
2. The admin creates, edits, or deletes an activity.
3. The system validates the data.
4. The system saves changes and updates the calendar.

### Exception Flows:
- If invalid data is entered, the system displays an error message.

## UC6 – View and Manage Registrations (View Activity Registration)
**Primary Actor:** Admin (Staff Member)
**Supporting Actors:** DB
**Preconditions:** Admin is authorized (logged in). Activities exist.
**Postconditions:** Registration list is displayed and changes (if any) are saved.

### Basic Flow:
1. Admin opens the management panel.
2. Admin selects an activity.
3. The system displays all registrations for that activity (name, phone, status, payment/attendance flags).
4. Admin filters/sorts registrations (optional).
5. Admin updates a registration status (e.g., cancel / mark as paid / move to waitlist).
6. The system validates the change.
7. The system saves the update in the DB and shows a success message.
   
### Exception Flows:
- If the activity does not exist anymore → system shows an error message.
- If DB is unavailable → system shows “Try again later” and no changes are saved.
- If admin is not authorized → access denied.

## UC7 – Check Attendance
**Primary Actor:** Admin (Staff Member)
**Supporting Actors:** DB
**Preconditions:** Admin is authorized. The activity exists and has registrations.
**Postconditions:** Attendance is updated for selected participants.

### Basic Flow:
1. Admin selects an activity from the management panel.
2. The system displays the list of registered participants.
3. Admin marks participants as “Present/Absent”.
4. The system saves attendance results in the DB.
5. The system shows updated attendance summary.
   
### Exception Flows:
- If no registrations exist → system displays “No participants registered”.
- If saving fails → system shows an error and keeps previous attendance state.
  
## UC8 – Send Notification
**Primary Actor:** Admin (Staff Member)
**Supporting Actors:** WhatsApp API, DB
**Preconditions:** Admin is authorized. Recipients exist (registered participants).
**Postconditions:** Notification status is stored (sent/failed).

### Basic Flow:
1. Admin selects an activity and clicks “Send Notification”.
2. Admin chooses message type (confirmation / reminder / change / cancellation).
3. The system builds the recipient list from DB.
4. The system sends messages via WhatsApp API.
5. The system logs results (sent/failed) in DB and shows a summary.
   
### Exception Flows:
- If WhatsApp API is unavailable → system shows “Service unavailable” and logs failure.
- If some numbers are invalid → system sends to valid recipients and reports invalid ones.
  
## UC9 – View Statistics
**Primary Actor:** Admin (Staff Member)
**Supporting Actors:** DB
**Preconditions:** Admin is authorized.
**Postconditions:** Statistics are displayed.

### Basic Flow:
1. Admin opens “Statistics”.
2. The system shows stats such as:
3. Number of registrations per activity
4. Attendance rate
5. Paid vs unpaid registrations
6. Admin can filter by date range/activity.
7. The system updates the view accordingly.

### Exception Flows:
- If there is no data → system displays “No data available”.
- If DB is unavailable → system displays an error message.







