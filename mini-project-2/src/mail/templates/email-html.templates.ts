export const EmailTemplates = {
  registration: (name: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #4CAF50;">Welcome to Eventify, ${name}!</h2>
      <p>Your account registration has been successfully verified.</p>
      <p>You can now browse available local events and manage system bookings.</p>
    </div>
  `,

  bookingConfirmation: (name: string, eventTitle: string, bookingId: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #2196F3;">Ticket Booking Confirmed!</h2>
      <p>Hello ${name}, your seat is secured for the upcoming event.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background-color: #f2f2f2;"><th style="padding: 8px; text-align: left;">Booking ID</th><td style="padding: 8px;">${bookingId}</td></tr>
        <tr><th style="padding: 8px; text-align: left;">Event Name</th><td style="padding: 8px;">${eventTitle}</td></tr>
      </table>
    </div>
  `,

  eventReminder: (name: string, eventTitle: string, eventDate: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #FF9800;">⏰ Upcoming Event Reminder</h2>
      <p>Hi ${name}, this is an automated system notification that your event is coming up soon.</p>
      <p><strong>Event:</strong> ${eventTitle}<br/><strong>Schedule Date:</strong> ${eventDate}</p>
    </div>
  `,

  bookingCancellation: (name: string, eventTitle: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #f44336;">Booking Cancelled Successfully</h2>
      <p>Dear ${name}, your booking reservation for <strong>${eventTitle}</strong> has been cancelled and refunded.</p>
    </div>
  `
};