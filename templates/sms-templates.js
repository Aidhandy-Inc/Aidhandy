export const smsTemplates = {
  welcome: (userName) => ({
    body: `Welcome ${userName}! 🎉 Thanks for joining our app. We're excited to have you on board!`
  }),

  verification: (code) => ({
    body: `Your verification code is: ${code}. This code will expire in 10 minutes. 🔐`
  }),

  bookingConfirmation: (bookingDetails) => ({
    body: `✈️ Booking Confirmed!\nID: ${bookingDetails.id}\nFlight: ${bookingDetails.origin} → ${bookingDetails.destination}\nDate: ${bookingDetails.date}\nPassenger: ${bookingDetails.passengerName}`
  }),

  passwordReset: (resetCode) => ({
    body: `Password reset code: ${resetCode}. Use this code to reset your password. This code expires in 15 minutes.`
  }),

  test: (userName) => ({
    body: `🧪 Test SMS for ${userName}! This is a test message from our application. Timestamp: ${new Date().toLocaleString()}`
  })
};