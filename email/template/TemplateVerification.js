import i18next from 'i18next';

export const TemplateVerification = (user, token, language) => {
  const t = i18next.getFixedT(language);
  const url = `http://127.0.0.1:5173/verify-account/${token}`;

  return (
    `<html>
      <head></head>
      <body style="background-color: rgb(230,230,230); font-family: Arial, Helvetica, sans-serif;">
        <table style="margin: 20px 0px">
          <tr>
            <td>
              <table style="width: 80%; margin: 20px auto; padding: 10px; background-color: rgb(250,250,250); color: rgb(69,69,69); font-size: 16px; text-align: center; border-radius: 10px;">
                <tr>
                  <td><h1 style="margin-top: 15px;">${t("header.welcome", { user })}</h1></td>
                </tr>
                <tr>
                  <td><p style="margin: 15px 0; line-height: 1.5;">${t("verification.thank_you")}</p></td>
                </tr>
                <tr>
                  <td style="padding: 40px 0px;"><a href="${url}" target="_blank" style="padding: 18px 38px; background-color: rgb(169, 223, 216); color: rgb(67, 99, 94); font-size: 18px; text-decoration: none; border-radius: 5px;"><strong>${t("verification.button_verify_acconut")}</strong></a></td>
                </tr>
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 15px 0; color: rgb(150, 150, 150); line-height: 1.5;">${t("body.copy_link")}</p>
                    <p><a href="${url}" style="color: rgb(52, 152, 219)">${url}</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: rgb(230,230,230); border-radius: 5px;">
                    <p style="margin-bottom: 0; font-size: 20px"><strong>REGISTER</strong></p>
                    <p style="margin-top: 7px; font-size: 14px;">${t("footer.ask_you_password")}</p>
                  </td>
                </tr>
              </table>
            <td>
          <tr>
        </table>
      </body>
    </html>`
  );
};