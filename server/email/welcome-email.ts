import { email } from "./email";

export async function welcomeMessage(
  to: string,
  link: string,
  username: string
) {
  const html = `
    <h1>Welcome, ${username}</h1>
    <p>Thank you for choosing MiniCloud! We're thrilled to have you on board.</p>
    <p>click <a href=${link} target="_blank">continue</a> to get started with storing files</p>
    <br/>
    <p>Best Regards,<p/>
    <p>The MiniCloud Team</p>
  `;
  const mailOptions = {
    to,
    from: "app.minicloud@gmail.com",
    subject: "Welcome to MiniCloud",
    html,
  };
  await email(mailOptions);
}
