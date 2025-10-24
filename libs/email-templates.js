export const emailTemplates = {
  // Simple test template
  test: (userName) => ({
    subject: `Test Email for ${userName}`,
    html: `
      <div>
        <h1>Test Email ✅</h1>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>This is a test email from our application.</p>
        <p>If you received this, email setup is working!</p>
        <p>Best regards,<br>Dev Team</p>
      </div>
    `,
    text: `Test Email for ${userName}\n\nHi ${userName},\n\nThis is a test email from our application.\n\nBest regards,\nDev Team`
  }),

  // Simple welcome template
  welcome: (userName) => ({
    subject: `Welcome ${userName}!`,
    html: `
      <div>
        <h2>Welcome to Our App!</h2>
        <p>Hi ${userName}, thanks for joining us.</p>
        <p>We're excited to have you on board.</p>
      </div>
    `,
    text: `Welcome ${userName}!\n\nThanks for joining our app.\n\nBest regards,\nThe Team`
  })
};