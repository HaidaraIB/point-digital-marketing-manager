
import { TwilioConfig } from "../types.ts";

export const sendSMS = async (config: TwilioConfig, to: string, body: string) => {
  if (!config.isEnabled || !config.accountSid || !config.authToken) {
    console.warn("SMS integration is disabled or credentials missing.");
    return false;
  }

  // تنظيف رقم الهاتف (التأكد من وجود مفتاح الدولة)
  let formattedTo = to.trim();
  if (formattedTo.startsWith('07')) {
    formattedTo = '+964' + formattedTo.substring(1);
  } else if (!formattedTo.startsWith('+')) {
    formattedTo = '+' + formattedTo;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`));
  headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const params = new URLSearchParams();
  params.append('To', formattedTo);
  params.append('From', config.fromNumber);
  params.append('Body', body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: params.toString()
    });

    if (response.ok) {
      console.log("SMS sent successfully!");
      return true;
    } else {
      const errorData = await response.json();
      console.error("Twilio Error:", errorData);
      return false;
    }
  } catch (error) {
    console.error("SMS Delivery Failed:", error);
    return false;
  }
};
