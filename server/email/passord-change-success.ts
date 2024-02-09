import { email } from "./email";

export async function changePasswordSuccessEmail(to: string, link: string) {
  const html = `
    <h1>Password reset Success</h1>
    <p>Your password has been successfully changed.</p>
    <p>continue to <a href=${link} target="_blank">Login</a></p> 
     <br/>
    <p>The MiniCloud Team</p>
  `;
  const mailOptions = {
    to,
    from: "app.minicloud@gmail.com",
    subject: "password changed",
    html,
  };
  await email(mailOptions);
}
