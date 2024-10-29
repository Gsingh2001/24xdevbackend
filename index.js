import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS from all origins for testing
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Create a transporter object using Zoho Mail SMTP transport
const mailTransport = nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send email
const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.DEFAULT_FROM_EMAIL,
        to,
        subject,
        html: htmlContent,
    };

    try {
        const info = await mailTransport.sendMail(mailOptions);
        console.log(`Email successfully sent to ${to}: ${info.response}`);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        throw error;
    }
};

// API endpoint to send email
app.post('/send-email', async (req, res) => {
    const {
        bestTimeToCall,
        budget,
        contactNumber,
        currency,
        deadlineDate,
        email,
        extraInfo,
        name,
        otherService,
        services,
    } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Recipient email is required.' });
    }

    const emailSubject = 'Thank You for Getting Started with 24xdev.uk Web Solutions';
    const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Thank You for Getting Started!</h2>
        <p>Dear ${name || 'Client'},</p>
        <p>Thank you for reaching out to us at <strong>24xdev.uk Web Solutions</strong>. We appreciate your interest and are excited to help you with your web solutions needs.</p>
        <p>Our team will review your request and get back to you shortly to discuss how we can assist you in achieving your goals.</p>
        <p>If you have any immediate questions or require further assistance, please feel free to reply to this email.</p>
        <p>Thank you once again for choosing us. We look forward to working with you!</p>
        <p>Best regards,</p>
        <p><strong>The 24xdev.uk Team</strong><br>
        24xdev.uk Web Solutions<br>
        United Kingdom</p>
    </div>
    `;

    try {
        await sendEmail(email, emailSubject, emailContent);

        const additionalEmailSubject = 'New Inquiry from Client';
        const additionalEmailContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Inquiry Details</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact Number:</strong> ${contactNumber}</p>
            <p><strong>Best Time to Call:</strong> ${bestTimeToCall}</p>
            <p><strong>Budget:</strong> ${currency} ${budget}</p>
            <p><strong>Deadline Date:</strong> ${deadlineDate}</p>
            <p><strong>Other Service:</strong> ${otherService}</p>
            <p><strong>Services Interested:</strong> ${services.join(', ')}</p>
            <p><strong>Extra Info:</strong> ${extraInfo}</p>
        </div>
        `;

        sendEmail('gsingh07@outlook.in', additionalEmailSubject, additionalEmailContent).catch((error) => {
            console.error('Failed to send additional email:', error);
        });

        return res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send email.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
