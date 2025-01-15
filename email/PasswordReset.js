import FormData from "form-data";
import Mailgun from 'mailgun.js';
import dotenv from "dotenv";
import { TemplatePasswordReset } from "./template/TemplatePasswordReset.js";

dotenv.config();

export const emailPasswordReset = (nameUser, email, token, language) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

  mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `Register <no-replay@register.pl>`,
    to: ["maciejregister@gmail.com"],
    subject: "Resetowanie hasła",
    text: `REGISTER - Witaj ${nameUser} - Kliknij w poniższy przycisk aby ustawić nowe hasło. - <a href="http://127.0.0.1:5173/verify-account/${token}">Resetuj hasło</a>`,
    html: TemplatePasswordReset(nameUser, token, language)
  })
  .then(msg =>console.log(msg))
  .catch(err => console.log(err));
}