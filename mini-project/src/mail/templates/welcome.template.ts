export const getPasswordResetTemplate = (offerTitle: string, setupCode: number): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #D0021B;">Admin Notification: Action Required Security Code</h2>
      <p>A new offer entry titled <strong>"${offerTitle}"</strong> has been successfully generated in the Churnetwork Admin System.</p>
      <p>Please utilize the secure authentication verification token pin below to complete the administrative tracking setup sequence:</p>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #333;">${setupCode}</span>
      </div>
      <p style="color: #ff9800; font-size: 13px;">⚠️ This security verification sequence token expires shortly. Do not share this code with unauthorized personnel.</p>
    </div>
  `;
};