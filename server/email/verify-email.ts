import { email } from "./email";

export async function verifyAccount(to: string, verificationCode: string) {
  const html = `
    <h1>Account Verification</h1>
    <p>Use the code below to verify your account</p>
    <p>The code will expire in 5 minutes.</p>
    <h2 style="background-color: green; padding: 10px; display: inline-block;">${verificationCode}</h2>
    <br/>
    <p>The MiniCloud Team</p>
  `;
  const mailOptions = {
    to,
    from: "app.minicloud@gmail.com",
    subject: "Account Verification",
    html,
  };
  await email(mailOptions);
}
