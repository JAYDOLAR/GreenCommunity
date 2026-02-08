# 🧪 Testing Payment Invoice in Test Mode

## Prerequisites
- Razorpay Test Keys (already configured ✅)
- Email service configured with Gmail credentials
- Both client and server running

## 🎯 Test Steps

### 1. **Start the Application**
```bash
# Terminal 1 - Start Server
cd /Users/bhavya/Desktop/GreenCommunity/Server
npm start

# Terminal 2 - Start Client  
cd /Users/bhavya/Desktop/GreenCommunity/client
npm run dev
```

### 2. **Open Browser & Navigate**
- Go to `http://localhost:3000`
- Login to your account
- Navigate to Projects page
- Click "Contribute" on any project

### 3. **Fill Payment Details**
- Enter contribution amount (minimum ₹1)
- Fill billing information with **your real email** (for testing invoice)
- Complete all required fields

### 4. **Use Razorpay Test Cards**

#### ✅ **Success Test Cards:**
- **Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVV:** Any 3 digits (e.g., `123`)
- **Name:** Any name

#### ❌ **Failure Test Cards (for testing error handling):**
- **Card Number:** `4000 0000 0000 0002` (Declined)
- **Card Number:** `4000 0000 0000 0069` (Expired Card)

### 5. **Test Payment Flow**

1. Click "Contribute Now" 
2. Razorpay popup opens
3. Enter test card details
4. Click "Pay Now"
5. **Check browser console** for logs:
   ```
   💳 Payment verification request: {...}
   📧 Attempting to send invoice email...
   ✅ Invoice email sent successfully
   ```

### 6. **Verify Email Delivery**

Check the email address you provided for:
- **Subject:** `Payment Invoice - GreenCommunity Contribution | INV-xxxxx`
- **Professional invoice template** with:
  - Payment details (amount, project, payment ID)
  - Environmental impact (CO₂ offset)
  - Invoice number and date
  - Billing information

### 7. **Server-Side Verification**

Check server console for logs:
```
📧 Invoice email request received: {...}
📧 Sending invoice email to: your-email@example.com
💰 Payment details: {...}
✅ Invoice email sent successfully to: your-email@example.com
```

## 🔧 **Debugging Tips**

### If Email Not Received:
1. **Check Gmail SMTP settings** in Server/.env:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password  # Not regular password!
   ```

2. **Generate Gmail App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Check server logs** for email errors

### If Payment Fails:
1. Verify Razorpay test keys are correct
2. Check browser network tab for API errors
3. Ensure both servers are running

## 🎛️ **Advanced Testing**

### Test Different Scenarios:
1. **Valid payment + valid email** ✅
2. **Valid payment + invalid email** (check error handling)
3. **Failed payment** (no email should be sent)
4. **Different contribution amounts** (₹100, ₹5000, ₹50000)
5. **Different projects** (to test project name in invoice)

### Check Server Responses:
```bash
# Test email endpoint directly (optional)
curl -X POST http://localhost:5000/api/email/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "amount": "1000",
    "projectName": "Test Project",
    "paymentId": "pay_test_123",
    "orderId": "order_test_123",
    "co2Impact": "2.5 tons"
  }'
```

## ✅ **Success Criteria**

✅ Payment completes successfully  
✅ Console shows email sending logs  
✅ Invoice email received in inbox  
✅ Email contains all payment details  
✅ Professional formatting and branding  
✅ Correct amount and project information  

## 📧 **Expected Email Content**

The invoice email should include:
- **Header:** GreenCommunity branding
- **Invoice Details:** Number, date, payment ID
- **Payment Summary:** Project name, amount in ₹
- **Environmental Impact:** CO₂ offset calculation
- **Billing Info:** Your name and email
- **Footer:** Payment method and support contact

---

**Ready to test? Start both servers and follow the steps above!** 🚀


API Key: bc42dc9538ade3148f9c
API Secret: 64cde5eeafc20a8edad1159168b0e6817687410d4da08ae2fccf92ca61fb89c5
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMDBkNjVjZC05YWU2LTQyYjctYTgyNy0xYTdkMTgzYTJhNTQiLCJlbWFpbCI6InNvbmlncmFiaGF2eWEyOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYmM0MmRjOTUzOGFkZTMxNDhmOWMiLCJzY29wZWRLZXlTZWNyZXQiOiI2NGNkZTVlZWFmYzIwYThlZGFkMTE1OTE2OGIwZTY4MTc2ODc0MTBkNGRhMDhhZTJmY2NmOTJjYTYxZmI4OWM1IiwiZXhwIjoxODAyMDQxODg5fQ.R3hKioBGW1x_xTrtwxXveLWy5DaLedmcGvx9c5yZ9vY

13800

2028
3072
=5100

2600
500
550
=3650

=1450

700
715