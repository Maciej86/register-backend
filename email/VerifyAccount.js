import FormData from "form-data";
import Mailgun from 'mailgun.js';
import dotenv from "dotenv";
import { TemplateVerify } from "./template_verify.js";

dotenv.config();

export const verifyAccount = (first_name, email, verificationToken) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

  mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `Register <no-replay@register.pl>`,
    to: ["maciejregister@gmail.com"],
    subject: "Weryfikacja konta",
    text: `REGISTER - Witaj ${first_name} - Kliknij w poniższy przycisk aby zweryfikować konto. - <a href="http://127.0.0.1:5173/verify-account/${verificationToken}">Weryfikuj konto</a>`,
    html: TemplateVerify(first_name, verificationToken)
  })
  .then(msg => res.send(msg))
  .catch(err => res.send(err));
}