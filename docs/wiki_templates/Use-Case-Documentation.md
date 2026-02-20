## System Actors

1. **Visitor / Participant** – A user who browses activities and registers for events without creating an account.

2. **Admin (Staff Member)** – A staff member of the association who manages activities and registrations.

3. **External Payment System** – A third-party payment service that processes online payments for paid activities.

4. **DB** - External Data Storage Service

## Use-Case UML

The system includes the following main use cases:

- View Monthly Calendar
- View Activity Details
- Register for Activity
- Pay by Credit Card
- Manage Activities
- View and Manage Registrations
![Use Case Diagram](../images/use-case-diagram.png)
# Use-Case Templates

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

