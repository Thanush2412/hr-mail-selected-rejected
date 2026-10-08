// ─── FACE Prep Selection & Rejection Mailer — Google Apps Script Backend ─────
//
// Features:
//   1. High-Performance Selected & Rejected Email Dispatch
//   2. Inline Branded Email Header, Logos & Feedback CTA Button
//   3. Google Sheet Real-time Data Sync & Status Logging
//   4. Zero external image dependencies (inline Base64 assets)
//
// DEPLOYMENT INSTRUCTIONS:
//   1. Open https://script.google.com -> New Project
//   2. Paste this entire code into Code.gs
//   3. Click Deploy -> New deployment -> Web app
//   4. Set 'Execute as' = Me
//   5. Set 'Who has access' = Anyone
//   6. Click Deploy -> Authorize access -> Copy the Web App URL
//   7. Paste the Web App URL into the Selection & Rejection Mailer website Settings
// ─────────────────────────────────────────────────────────────────────────────

// ─── ASSETS (INLINE BASE64 LOGO) ─────────────────────────────────────────────
const LOGO_B64 = "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";

function getInlineImages() {
  const images = {};
  try {
    if (LOGO_B64 && LOGO_B64.length > 50) {
      images.faceprepLogo = Utilities.newBlob(
        Utilities.base64Decode(LOGO_B64),
        'image/png',
        'faceprep-logo.png'
      );
    }
  } catch (e) {
    Logger.log('Logo blob error: ' + e.message);
  }
  return images;
}

// ─── doGet (API: GET SHEET DATA) ─────────────────────────────────────────────
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';

  if (action === 'getSheetData') {
    return handleGetSheetData(e.parameter);
  }

  return ContentService.createTextOutput("FACE Prep Selection & Rejection Mailer GAS API Active.")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ─── doPost (API: DISPATCH EMAIL) ────────────────────────────────────────────
function doPost(e) {
  let requestData = "(unknown)";
  try {
    requestData = e.postData.contents;
    const data = JSON.parse(requestData);

    // Single send with sheet logging
    if (data.to && data.subject && data.body) {
      return sendSingleEmailWithLogging(data);
    }

    return json({ status: "failed", error: "Missing required fields: to, subject, body" });
  } catch (err) {
    Logger.log("Mailer Error: " + err.message + " Payload: " + requestData);
    return json({ status: "failed", error: err.message });
  }
}

// ─── EMAIL DISPATCH & LOGGING ────────────────────────────────────────────────
function sendSingleEmailWithLogging(data) {
  try {
    const { sheetUrl, rowIndex, to, subject, body, cc, sender_name, candidateId, emailStatusColumn } = data;

    const emailData = {
      to: to,
      subject: subject,
      body: body,
      cc: cc || "",
      sender_name: sender_name || "Talent Acquisition Team - FACE Prep",
      candidateId: candidateId || ""
    };

    const htmlBody = wrapBody(emailData);
    const options = {
      htmlBody: htmlBody,
      name: emailData.sender_name,
      inlineImages: getInlineImages(),
    };

    if (cc && String(cc).trim()) {
      options.cc = String(cc).trim();
    }

    // Dispatch via Gmail
    GmailApp.sendEmail(to, subject, stripHtml(htmlBody), options);

    // Write back to Google Sheet if sheetUrl and rowIndex provided
    if (sheetUrl && rowIndex) {
      try {
        const ss = SpreadsheetApp.openByUrl(sheetUrl);
        const sheet = ss.getSheets()[0];
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const headersLower = headers.map(h => String(h).trim().toLowerCase());
        const mappedColName = emailStatusColumn ? emailStatusColumn.trim().toLowerCase() : '';
        
        let statusColIdx = mappedColName ? headersLower.indexOf(mappedColName) : -1;
        if (statusColIdx === -1) statusColIdx = headersLower.indexOf('email status');
        if (statusColIdx === -1) statusColIdx = headersLower.indexOf('mail sent status');
        if (statusColIdx === -1) statusColIdx = headersLower.indexOf('status');
        if (statusColIdx === -1) {
          statusColIdx = headers.length;
          sheet.getRange(1, statusColIdx + 1).setValue('Email Status');
        }

        const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        sheet.getRange(Number(rowIndex), statusColIdx + 1).setValue(`Sent to ${to} (${timestamp})`);
      } catch (sheetErr) {
        Logger.log(`Email sent but sheet log failed: ${sheetErr.message}`);
      }
    }

    return json({ status: "sent", to: to, message: "Email sent and logged successfully" });
  } catch (err) {
    Logger.log("Single email error: " + err.message);
    return json({ status: "failed", error: err.message });
  }
}

// ─── BRANDED EMAIL HTML WRAPPER ──────────────────────────────────────────────
function wrapBody(data) {
  const candidateId = data.candidateId || "";
  const FEEDBACK_URL = "https://forms.gle/Q8jMWuSXBRWjeHWQ8";
  const currentYear = new Date().getFullYear();

  const formattedBody = String(data.body || "")
    .split(/\n\n+/)
    .map(function(para) {
      para = para.trim();
      if (!para) return '';
      if (para === FEEDBACK_URL) {
        return `
        <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
          <tr>
            <td bgcolor="#f05136" style="padding:12px 28px;border-radius:4px;">
              <a href="${FEEDBACK_URL}"
                 style="font-size:13px;font-weight:bold;letter-spacing:.06em;
                        text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:Verdana,Geneva,sans-serif;display:inline-block;">
                Share Feedback &rarr;
              </a>
            </td>
          </tr>
        </table>`;
      }
      if (para.startsWith('http')) {
        return `<p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:#333;">
          <a href="${para}" style="color:#f05136;text-decoration:none;font-weight:bold;">${para}</a>
        </p>`;
      }
      return `<p style="margin:0 0 16px;font-size:14px;line-height:1.85;color:#333;font-family:Verdana,Geneva,sans-serif;">${para.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('');

  const isRejection = String(data.subject || "").toLowerCase().includes("update on your");
  const headerTitle = isRejection
    ? `Interview Update<br/><span style="color:#f05136;">from FACE Prep</span>`
    : `Congratulations!<br/><span style="color:#f05136;">from FACE Prep</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${data.subject}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Verdana,Geneva,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F4F4;">
  <tr><td align="center" style="padding:32px 12px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:600px;max-width:600px;background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.08);border:1px solid #e2e8f0;">

      <!-- HEADER -->
      <tr>
        <td bgcolor="#1A1A1A" style="padding:32px 48px 30px;border-bottom:3px solid #f05136;">
          <img src="cid:faceprepLogo" alt="FACE Prep" width="110"
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

      <!-- BODY CONTENT -->
      <tr>
        <td bgcolor="#ffffff" style="padding:40px 48px 10px;">
          ${formattedBody}
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
          <img src="cid:faceprepLogo" alt="FACE Prep" width="70"
               style="display:inline-block;margin-bottom:12px;opacity:0.4;filter:grayscale(100%);"/>
          <p style="margin:0 0 10px;font-size:12px;color:#999999;line-height:1.6;font-family:Verdana,Geneva,sans-serif;">
            This message was sent to <strong style="color:#555555;">${data.to}</strong>
          </p>
          <p style="margin:0 0 16px;font-size:11px;font-family:Verdana,Geneva,sans-serif;">
            <a href="https://faceprep.in/privacy" target="_blank" style="color:#f05136;text-decoration:none;">Privacy Policy</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="https://faceprep.in/contact" target="_blank" style="color:#f05136;text-decoration:none;">Contact Us</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="https://faceprep.in" target="_blank" style="color:#f05136;text-decoration:none;">Visit Website</a>
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

// ─── SHEET DATA FETCH HANDLER ────────────────────────────────────────────────
function handleGetSheetData(params) {
  try {
    const url = params.url;
    if (!url) return json({ status: 'error', message: 'Missing sheet URL' });

    const ss = SpreadsheetApp.openByUrl(url);
    const sheet = ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return json({ status: 'success', headers: [], data: [] });

    const headers = data[0].map(h => String(h).trim());
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowObj = { _rowIndex: i + 1 };
      let hasData = false;
      for (let j = 0; j < headers.length; j++) {
        const val = row[j];
        rowObj[headers[j]] = val !== undefined && val !== null ? String(val).trim() : '';
        if (rowObj[headers[j]]) hasData = true;
      }
      if (hasData) rows.push(rowObj);
    }

    return json({ status: 'success', headers: headers, data: rows, totalRows: rows.length });
  } catch (err) {
    return json({ status: 'error', message: err.message });
  }
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────
function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&rarr;/g, '->')
    .replace(/&copy;/g, '(c)')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
