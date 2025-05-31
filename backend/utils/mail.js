/*import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    sandbox: true, // Set to true for sandbox domain
  });
  try {
    const data = await mg.messages.create(`${process.env.MAILGUN_DOMAIN}`, {
      from: `Mailgun Sandbox <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: ["sndbx10@gmail.com"],
      subject: "Hello sandbox",
      text: "Congratulations sandbox, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
  */