import { TwilioConfig } from "../types.ts";
import { apiUrl, getAuthHeaders, isApiEnabled } from "./api.ts";

export interface SendSMSResult {
  success: boolean;
  error?: string;
}

/**
 * Send SMS. When API is enabled, uses backend (recommended: no CORS, credentials safe).
 * Otherwise tries Twilio from browser (may fail due to CORS).
 */
export const sendSMS = async (
  config: TwilioConfig,
  to: string,
  body: string
): Promise<SendSMSResult> => {
  if (!config.isEnabled) {
    return { success: false, error: "إرسال الرسائل معطل في الإعدادات." };
  }

  const useBackend = isApiEnabled();

  if (useBackend) {
    try {
      const url = apiUrl("/api/send-sms/");
      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ to: to.trim(), body }),
      });
      const data = await res.json().catch(() => ({}));
      const success = res.ok && data?.success === true;
      return { success, error: success ? undefined : (data?.error || "فشل الإرسال") };
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      return { success: false, error: err };
    }
  }

  // Fallback: direct Twilio from browser (often blocked by CORS)
  if (!config.accountSid || !config.authToken) {
    return { success: false, error: "بيانات Twilio ناقصة." };
  }

  let formattedTo = to.trim();
  if (formattedTo.startsWith("07")) {
    formattedTo = "+964" + formattedTo.substring(1);
  } else if (!formattedTo.startsWith("+")) {
    formattedTo = "+" + formattedTo;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const headers = new Headers();
  headers.set("Authorization", "Basic " + btoa(`${config.accountSid}:${config.authToken}`));
  headers.set("Content-Type", "application/x-www-form-urlencoded");
  const params = new URLSearchParams();
  params.append("To", formattedTo);
  params.append("From", config.fromNumber);
  params.append("Body", body);

  try {
    const response = await fetch(url, { method: "POST", headers, body: params.toString() });
    if (response.ok) return { success: true };
    const errorData = await response.json().catch(() => ({}));
    const errMsg = (errorData as { message?: string })?.message || "فشل إرسال الرسالة";
    return { success: false, error: errMsg };
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    return { success: false, error: err };
  }
};
