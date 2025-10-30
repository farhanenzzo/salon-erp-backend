export const generateVerificationEmail = (
  name,
  emailVerificationLink,
  email,
  generatedPassword
) => {
  const subject = "Verify Your Email - Luxelooks";

  // Plain text email content (for email clients that don't support HTML)
  const text = `
Hello ${name},

Thank you for registering with us!

To complete your registration, please verify your email address by clicking the link below:

${emailVerificationLink}

Once your email is verified, you can log in using the following credentials:

- Email: ${email}
- Password: ${generatedPassword}

If you have any questions or issues, feel free to reach out to us.

Thank you for choosing our service!

Best regards,  
Luxelooks Support Team
`;

  // HTML email content
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 20px; background-color: #f4f4f4;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <h2 style="font-size: 24px; color: #5a5a5a;">Welcome to Luxelooks, ${name}!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; text-align: center;">
              <p style="font-size: 16px; color: #555555; margin: 10px 0;">
                Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below.
              </p>
              <a href="${emailVerificationLink}" 
                 style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 20px; font-size: 16px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                Verify Email
              </a>
              <p style="font-size: 14px; color: #777777; margin: 15px 0;">
                If the button above doesn't work, copy and paste the following link into your browser:
              </p>
              <p style="word-break: break-all; font-size: 14px; color: #007bff;">${emailVerificationLink}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 16px; color: #555555;">
                Once verified, you can log in using the credentials below:
              </p>
              <p style="font-size: 16px; font-weight: bold; color: #333;">Email: ${email}</p>
              <p style="font-size: 16px; font-weight: bold; color: #333;">Password: ${generatedPassword}</p>
              <p style="font-size: 14px; color: #888888;">
                If you have any questions, feel free to reach out to us.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; font-size: 14px; color: #888888;">
              <p>&copy; ${new Date().getFullYear()} Luxelooks. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, text, html };
};


export const generateOtpEmailContent = (otp) => {
  const subject = "Your OTP Code";

  // Plain text content
  const text = `Dear User,\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease do not share it with anyone.\n\nIf you did not request this OTP, please ignore this message.`;

  // HTML email content
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; padding: 20px; background-color: #f4f4f4;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <h2 style="font-size: 24px; color: #5a5a5a;">Your OTP Code</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; text-align: center;">
              <h3 style="font-size: 20px; color: #333333;">${otp}</h3>
              <p style="font-size: 16px; color: #555555; margin: 10px 0;">
                If you did not request this OTP, please disregard this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; text-align: center; font-size: 14px; color: #888888;">
              <p>&copy; ${new Date().getFullYear()} Luxelooks. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, text, html };
};

export const paymentConfirmationTemplate = (order) => {
  const subject = "Payment Confirmation";
  const text = `Thank you for your payment. Your order ID is ${order._id}.`;
  const html = `
    <p>Thank you for your payment.</p>
    <p>Your order ID is <strong>${order._id}</strong>.</p>
    <p>Order details:</p>
    <ul>
      <li>Status: ${order.status}</li>
      <li>Amount: ${order.totalAmount}</li>
    </ul>
  `;

  return { subject, text, html };
};
