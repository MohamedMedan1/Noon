import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL;
const emailPass = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPass) {
  throw new Error('Email transport is not configured. Set EMAIL and EMAIL_PASSWORD in your environment.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"Noon Team" <${emailUser}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="font-size: 16px; color: #555;">Your verification code is:</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #000; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #777;">This code expires in <strong style="color: #d9534f;">5 minutes</strong>.</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('Failed to send OTP email to', email, error);
    throw error;
  }
};