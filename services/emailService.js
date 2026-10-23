const axios = require("axios");

async function sendWelcomeEmail(user) {
  if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    console.warn("Welcome email skipped: BREVO_API_KEY or SENDER_EMAIL is not configured.");
    return { sent: false, reason: "not_configured" };
  }

  const safeName = escapeHtml(user.name);
  const payload = {
    sender: { name: process.env.SENDER_NAME || "FoodExpress", email: process.env.SENDER_EMAIL },
    to: [{ email: user.email, name: user.name }],
    subject: "Your FoodExpress account was created successfully!",
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333"><div style="background:#ff6b00;color:#fff;padding:22px;text-align:center;border-radius:12px 12px 0 0"><h1 style="margin:0">🍽 FoodExpress</h1></div><div style="padding:24px;border:1px solid #eee;border-radius:0 0 12px 12px"><h2>Hello ${safeName}!</h2><p>Your FoodExpress account has been created successfully.</p><p>You can now log in, explore our menu, and place an order whenever you are hungry.</p><p>Thank you for joining us!</p><p>— The FoodExpress Team</p></div></div>`
  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
      timeout: 10000
    });
    return { sent: true, messageId: response.data.messageId };
  } catch (error) {
    // Email failures must not undo an account that was already saved.
    console.error("Brevo welcome email failed:", error.response?.data || error.message);
    return { sent: false, reason: "provider_error" };
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
module.exports = { sendWelcomeEmail };
