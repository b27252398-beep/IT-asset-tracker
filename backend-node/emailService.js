const nodemailer = require('nodemailer');

let transporter = null;

// Initialize Ethereal Email test account asynchronously
async function initTransporter() {
  try {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Email Notification Service Initialized via Ethereal");
  } catch (err) {
    console.error("Failed to initialize Ethereal Email", err);
  }
}

initTransporter();

/**
 * Fires an email safely without blocking the main event loop
 */
const sendNotificationEmail = async (to, subject, htmlContent) => {
  if (!transporter) {
    console.warn("Email requested but transporter is not ready yet.");
    return;
  }
  try {
    let info = await transporter.sendMail({
      from: '"ITAM Notification System" <no-reply@itam-sys.test>',
      to: to,
      subject: subject,
      html: htmlContent,
    });
    console.log("-----------------------------------------");
    console.log(`✉️ Email Sent: ${subject}`);
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Error sending email", err);
  }
};

module.exports = {
  sendNotificationEmail
};
