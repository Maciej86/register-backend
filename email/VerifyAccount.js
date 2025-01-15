import FormData from "form-data";
import Mailgun from 'mailgun.js';
import dotenv from "dotenv";
import i18next from 'i18next';
import { TemplateVerification } from "./template/TemplateVerification.js";

dotenv.config();

export const emailVerifyAccount = (nameUser, email, token, language) => {
  const t = i18next.getFixedT(language);
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});
  const url = `${process.env.DOMAIN}/verify-account/${token}`;

  mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `Register <no-replay@register.pl>`,
    to: ["maciejregister@gmail.com"],
    subject: "Weryfikacja konta",
    text: t("password_reset.thank_you_text", {nameUser, url}),
    html: TemplateVerification(nameUser, token, language)
  })
  .then(msg =>console.log(msg))
  .catch(err => console.log(err));
}