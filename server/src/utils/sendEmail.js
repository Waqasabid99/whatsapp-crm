import { Resend } from "resend";
import { staffInviteHtml } from "./emailTemplate.js"; 

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send staff invite email
 * @param {string} toEmail 
 * @param {string} token 
 * @param {string} workspaceName 
 * @param {string?} name 
 */
export async function sendInviteEmail(toEmail, token, workspaceName, name = "") {
  const acceptUrl = `${process.env.ORIGIN_URL}/staff/accept-invite?token=${encodeURIComponent(token)}`;

  const html = staffInviteHtml(name, workspaceName, acceptUrl);

  const { data, error } = await resend.emails.send({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: [toEmail],
    subject: `You’re invited to join workspace "${workspaceName}"`,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send invite email");
  }

  return data;
}