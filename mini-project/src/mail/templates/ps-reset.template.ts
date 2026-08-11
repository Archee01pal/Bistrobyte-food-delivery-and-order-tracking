export const getWelcomeTemplate = (name: string, verificationLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4A90E2;">Welcome to Churnetwork, ${name}! 🎉</h2>
      <p>Thank you for signing up. To complete your registration and activate your account, please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify My Account</a>
      </div>
      <p style="font-size: 12px; color: #777;">If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #4A90E2;">${verificationLink}</p>
    </div>
  `;
};