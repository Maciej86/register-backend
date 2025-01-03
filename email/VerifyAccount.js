import FormData from "form-data";
import Mailgun from 'mailgun.js';
import dotenv from "dotenv";
import { TemplateVerification } from "./TemplateVerification.js";

dotenv.config();

export const verifyAccount = (first_name, email, verificationToken, language) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

  mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `Register <no-replay@register.pl>`,
    to: ["maciejregister@gmail.com"],
    subject: "Weryfikacja konta",
    text: `REGISTER - Witaj ${first_name} - Kliknij w poniższy przycisk aby zweryfikować konto. - <a href="http://127.0.0.1:5173/verify-account/${verificationToken}">Weryfikuj konto</a>`,
    html: TemplateVerification(first_name, verificationToken, language)
  })
  // .then(msg => res.send(msg))
  // .catch(err => res.send(err));
}