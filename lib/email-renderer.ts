import { LOGO_B64 } from "@/lib/email-assets";

export interface EmailRenderParams {
  to: string;
  name: string;
  result: "selected" | "rejected" | string;
  candidateId?: string;
  feedbackUrl?: string;
}

/**
 * Builds the exact 100% 1:1 HTML string matching Code.gs output for Selected and Rejected emails.
 * Uses inline Base64 assets so there are zero external image / proxy breakages.
 */
export function buildSelectionRejectEmailHtml(params: EmailRenderParams): string {
  const {
    to,
    name,
    result,
    candidateId = "",
    feedbackUrl = "https://forms.gle/Q8jMWuSXBRWjeHWQ8",
  } = params;

  const rawRes = (result || "").toLowerCase().trim();
  const isRejection = rawRes === "rejected";
  const currentYear = new Date().getFullYear();

  const headerTitle = isRejection
    ? `Interview Update<br/><span style="color:#f05136;">from FACE Prep</span>`
    : `Congratulations!<br/><span style="color:#f05136;">from FACE Prep</span>`;

  const bodyContent = isRejection ? `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">Dear ${name},</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">Thank you for taking the time to attend the interview at FACE Prep.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">After careful evaluation of your profile and performance in the interview, we regret to inform you that we will not be proceeding with your application at this moment. Please know that this decision does not reflect your abilities or potential, but rather the alignment of current role requirements.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We truly appreciate your interest in FACE Prep and the effort you put into the selection process. We encourage you to apply again in the future as new opportunities arise.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We would truly value your feedback regarding your recent interview experience with us. Your input helps us enhance our process and provide a better experience for all candidates.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We kindly request you to take a few moments to share your thoughts using the link below. Your feedback is highly appreciated.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td bgcolor="#f05136" style="padding:12px 28px;border-radius:4px;">
          <a href="${feedbackUrl}" target="_blank" rel="noreferrer" style="font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:Verdana,Geneva,sans-serif;display:inline-block;">Share Feedback &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">Wishing you the very best in your job search and all your future endeavors.</p>
  ` : `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">Dear ${name},</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">Thank you for taking the time to attend the interview at FACE Prep.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We are pleased to inform you that, based on your profile and performance in the interview, you have been selected to move forward with us. <strong>Congratulations!</strong></p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We were impressed with your skills and potential, and we believe you will be a valuable addition to our team. Our team will be sharing further details regarding the next steps, including offer formalities and onboarding process, shortly.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We truly appreciate your interest in FACE Prep and the effort you put into the selection process.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We would truly value your feedback regarding your recent interview experience with us. Your input helps us enhance our process and provide a better experience for all candidates.</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We kindly request you to take a few moments to share your thoughts using the link below. Your feedback is highly appreciated.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td bgcolor="#f05136" style="padding:12px 28px;border-radius:4px;">
          <a href="${feedbackUrl}" target="_blank" rel="noreferrer" style="font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:Verdana,Geneva,sans-serif;display:inline-block;">Share Feedback &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#333333;font-family:Verdana,Geneva,sans-serif;">We look forward to welcoming you to the team and wish you great success in your journey with FACE Prep.</p>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${isRejection ? "Update on Your Application" : "Congratulations! You've Been Selected"} - FACE Prep</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Verdana,Geneva,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F4F4;">
  <tr><td align="center" style="padding:28px 12px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:600px;max-width:600px;background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,0.09);border:1px solid #e2e8f0;">

      <!-- HEADER -->
      <tr>
        <td bgcolor="#1A1A1A" style="padding:32px 48px 30px;border-bottom:3px solid #f05136;">
          <img src="data:image/png;base64,${LOGO_B64}" alt="FACE Prep" width="110"
               style="display:block;width:110px;height:auto;border:0;margin-bottom:20px;"/>
          <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:28px;
                    font-weight:bold;line-height:1.3;color:#ffffff;">
            ${headerTitle}
          </p>
          ${candidateId ? `<p style="margin:0;font-size:12px;color:#aaaaaa;letter-spacing:.04em;font-family:Verdana,Geneva,sans-serif;">
            Candidate ID: <strong style="color:#ffffff;">${candidateId}</strong>
          </p>` : ""}
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td bgcolor="#ffffff" style="padding:40px 48px 10px;">
          ${bodyContent}
        </td>
      </tr>

      <!-- SIGN-OFF -->
      <tr>
        <td bgcolor="#ffffff" style="padding:10px 48px 40px;border-top:1px solid #f5f5f5;">
          <p style="margin:0;font-size:14px;line-height:1.8;color:#555555;font-family:Verdana,Geneva,sans-serif;">
            Warm regards,<br/>
            <strong style="font-size:15px;color:#1A1A1A;">Talent Acquisition Team</strong><br/>
            <span style="font-size:13px;color:#888888;">FACE Prep</span>
          </p>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td bgcolor="#f9f9f9" style="padding:30px 48px;border-top:1px solid #EBEBEB;text-align:center;">
          <img src="data:image/png;base64,${LOGO_B64}" alt="FACE Prep" width="70"
               style="display:inline-block;margin-bottom:12px;opacity:0.4;filter:grayscale(100%);"/>
          <p style="margin:0 0 10px;font-size:12px;color:#999999;line-height:1.6;font-family:Verdana,Geneva,sans-serif;">
            This message was sent to <strong style="color:#555555;">${to}</strong>
          </p>
          <p style="margin:0 0 16px;font-size:11px;font-family:Verdana,Geneva,sans-serif;">
            <a href="https://faceprep.in/privacy" target="_blank" rel="noreferrer" style="color:#f05136;text-decoration:none;">Privacy Policy</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="https://faceprep.in/contact" target="_blank" rel="noreferrer" style="color:#f05136;text-decoration:none;">Contact Us</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="https://faceprep.in" target="_blank" rel="noreferrer" style="color:#f05136;text-decoration:none;">Visit Website</a>
          </p>
          <p style="margin:0 0 4px;font-size:11px;color:#aaaaaa;line-height:1.6;font-family:Verdana,Geneva,sans-serif;">
            <strong>FACEPrep (Focus 4D Career Education)</strong><br/>
            No. 12, Lakshmi Nagar, Thottipalayam Pirivu,<br/>
            Off Avinashi Road, Coimbatore, Tamil Nadu - 641014
          </p>
          <p style="margin:8px 0 0;font-size:10px;color:#bbbbbb;font-family:Verdana,Geneva,sans-serif;">
            Copyright &copy; ${currentYear} FACE Prep. All rights reserved.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
