const nodemailer = require("nodemailer");

interface MAIL_OPTIONS {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export async function email(mailOptions: MAIL_OPTIONS) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "app.minicloud@gmail.com",
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail(mailOptions);
}
