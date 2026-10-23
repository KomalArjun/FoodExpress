# FoodExpress — MVC Food Ordering Website

This project converts the supplied FoodExpress HTML/CSS into a Node.js/Express MVC application. It keeps the original orange/peach styling and menu content, adds responsive CSS, MongoDB persistence, password-hashed registration/login, session-based authentication, saved orders, and a Brevo welcome email after registration.

## Stack and MVC layout

- **Model:** `models/User.js`, `models/Order.js` (Mongoose)
- **View:** `views/index.ejs` (your existing HTML page, served by Express)
- **Controller:** `controllers/authController.js`, `controllers/orderController.js`
- **Routes:** `routes/pageRoutes.js`, `routes/authRoutes.js`, `routes/orderRoutes.js`
- **Services:** `services/emailService.js` (Brevo API)
- **Middleware:** `middleware/auth.js`
- **Frontend:** `public/js/app.js`, `public/css/style.css`

## 1. Requirements

- Node.js 18 or newer
- MongoDB local installation **or** a MongoDB Atlas connection string
- Optional Brevo account/API key to send the registration welcome email

## 2. Install and configure

```bash
npm install
```

Copy `.env.example` to `.env` and set:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/foodexpress
SESSION_SECRET=use-a-long-random-secret-here
SESSION_MAX_AGE_DAYS=7
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender@example.com
SENDER_NAME=FoodExpress
```

Generate a session secret with a password manager or a command such as `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Do not commit `.env` or expose the Brevo API key in browser JavaScript.

For MongoDB Atlas, use the connection URI from Atlas and ensure your network/IP access settings allow your development machine to connect.

## 3. Add your food images

The uploaded HTML references local files under `image/`. Copy your existing `image` folder into `public/image/`, preserving the filenames. The login/registration background used to reference a Windows-only absolute path; it now looks for `public/image/order.jpg`. If that file is named differently, update the `background-image` URL in `public/css/style.css`.

If an image filename contains spaces, keep its filename unchanged and make sure the corresponding HTML path matches. The project contains the original markup but the image files were not included in the uploads.

## 4. Run

Start MongoDB, then run:

```bash
npm run dev
```

Or `npm start`. Open **http://localhost:3000**. Register an account, check the welcome email (if Brevo is configured), log in, add items to your cart, and place an order. Users and orders are saved in MongoDB; session data is also stored in MongoDB.

## 5. Configure Brevo email

1. Create/sign in to a Brevo account.
2. Verify a sender email address in Brevo.
3. Create an API key and set `BREVO_API_KEY` and `SENDER_EMAIL` in `.env`.
4. Restart the server and register using an email address you can access.

The welcome email is sent by the backend after MongoDB has created the user. If Brevo is not configured or its API is temporarily unavailable, registration still succeeds and the API response indicates that the email was not sent. Check the server console for provider errors.

## 6. API endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/` | Render website | No |
| POST | `/api/auth/register` | Create account and attempt welcome email | No |
| POST | `/api/auth/login` | Authenticate and start session | No |
| POST | `/api/auth/logout` | End session | Session |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/orders` | Validate and save an order | Yes |
| GET | `/api/orders/my` | List current user's recent orders | Yes |

## Notes and honest limitations

- Passwords are hashed with bcrypt; passwords are never stored in plain text.
- Login is session-based and session records are stored in MongoDB.
- The server validates order items and recalculates prices from a server-side catalogue rather than trusting prices from the browser.
- **Online payment is not integrated.** Google Pay, PhonePe, and UPI can be selected as a payment preference, but orders are saved with `paymentStatus: Pending`. The interface does not claim a real payment occurred. Integrate a payment provider such as Razorpay before accepting online payments in production.
- The server-side menu catalogue in `controllers/orderController.js` must be kept in sync with any menu price changes. Add every item from the original menu to that catalogue before expecting it to be orderable; the currently included list covers the items most visible in the supplied HTML, and should be checked against the complete menu.
- Before production deployment, configure HTTPS, stronger request validation, CSRF protection appropriate to the session setup, logging/monitoring, and an email retry/outbox mechanism.
