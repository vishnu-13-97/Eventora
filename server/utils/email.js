const nodemailer = require('nodemailer');

const dotenv = require('dotenv');
dotenv.config();


const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  service: 'gmail',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendBookingEmail = async (userEmail, userName, eventTitle ) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER,    
            to: userEmail,
            subject: `Event Booking Confirmed: ${eventTitle}`,
            text: `Hello ${userName},\n\nYour booking for the event "${eventTitle}" has been confirmed.\n\nThank you for using our service!`
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};



const sendOTPEmail = async (userEmail, otp, type) => {  
    try {
        const subject = type === 'account_verification' ? 'Account Verification OTP' : 'Event Booking OTP';
         const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: userEmail,
            subject,
               html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                   <h2 style="color: #111;">${subject}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);

        console.log(`OTP email sent to ${userEmail} for ${type}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};


module.exports = {
    sendBookingEmail,
    sendOTPEmail
};