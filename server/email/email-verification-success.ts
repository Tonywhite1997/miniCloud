import { email } from "./email";

export async function emailVerificationSuccessEmail(to: string, link: string) {
  const html = `
    <h1>Congratulations</h1>
    <p>Your email has been successfully verified.</p>
    <p>click <a href=${link} target="_blank">continue</a> to get started with storing files</p> 
     <br/>
    <p>The MiniCloud Team</p>
  `;
  const mailOptions = {
    to,
    from: "app.minicloud@gmail.com",
    subject: "Email Verified",
    html,
  };
  await email(mailOptions);
}
