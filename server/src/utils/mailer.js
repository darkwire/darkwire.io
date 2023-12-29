import dotenv from 'dotenv';

dotenv.config();

const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;

const apiKey = MAILGUN_API_KEY;
const domain = MAILGUN_DOMAIN;

let mailgun;

export default async data => {
  if (!mailgun) {
    if (apiKey && domain) {
      mailgun = (await import('mailgun-js'))({ apiKey, domain });
    } else {
      return;
    }
  }
  mailgun.messages().send(data, function (error, body) {});
};
