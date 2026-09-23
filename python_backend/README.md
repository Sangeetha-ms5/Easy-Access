# Python OTP Backend

## Install dependencies

```bash
cd python_backend
pip install -r requirements.txt
```

## Run the server

```bash
python app.py
```

## API endpoints

- POST /send-otp
  - body: {"phone": "9876543210", "full_name": "John Doe"}
- POST /verify-otp
  - body: {"phone": "9876543210", "otp": "123456"}
- GET /users
- GET /login-data

The login details are stored in a local SQLite database file named users.db.

## Twilio setup

Set these environment variables before starting the server:

```bash
export TWILIO_ACCOUNT_SID=your_account_sid
export TWILIO_AUTH_TOKEN=your_auth_token
export TWILIO_FROM_NUMBER=+15551234567
```

If these are not set, the server will still generate an OTP locally and return it in the API response for testing.
