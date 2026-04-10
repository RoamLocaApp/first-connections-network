exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
 
  let data;
  try {
    data = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }
 
  const { firstName, lastName, email, phone, company, subject, message } = data;
 
  if (!email || !firstName || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name, email and message are required" })
    };
  }
 
  const apiKey = process.env.FC_Website_API_Key;
 
  // ── STEP 1: Add contact to Brevo CRM (list 5) ──
  try {
    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Accept":       "application/json",
        "Content-Type": "application/json",
        "api-key":      apiKey
      },
      body: JSON.stringify({
        email:         email,
        attributes: {
          FIRSTNAME: firstName || "",
          LASTNAME:  lastName  || "",
          COMPANY:   company   || "",
        },
        listIds:       [5],
        updateEnabled: true
      })
    });
  } catch(err) {
    console.error("Brevo CRM error:", err);
    // Don't block the email send if CRM fails
  }
 
  // ── STEP 2: Send notification email via Brevo transactional API ──
  const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
      "api-key":      apiKey
    },
    body: JSON.stringify({
      sender: {
        name:  "First Connections Website",
        email: "hello@first-connections.co.uk"
      },
      to: [
        {
          email: "hello@first-connections.co.uk",
          name:  "First Connections"
        }
      ],
      replyTo: {
        email: email,
        name:  `${firstName} ${lastName}`
      },
      subject: `New Enquiry: ${subject || "General"} — ${firstName} ${lastName}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f7f8fc;border-radius:12px;">
          <div style="background:#1f3667;padding:24px 32px;border-radius:8px 8px 0 0;">
            <h2 style="color:white;margin:0;font-size:1.3rem;">New Enquiry — First Connections</h2>
          </div>
          <div style="background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e2e6f0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;width:140px;">
                  <strong style="color:#5a6478;font-size:0.85rem;">Name</strong>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">
                  ${firstName} ${lastName}
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;">
                  <strong style="color:#5a6478;font-size:0.85rem;">Email</strong>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;">
                  <a href="mailto:${email}" style="color:#2845A0;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;">
                  <strong style="color:#5a6478;font-size:0.85rem;">Phone</strong>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">
                  ${phone || "Not provided"}
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;">
                  <strong style="color:#5a6478;font-size:0.85rem;">Company</strong>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">
                  ${company || "Not provided"}
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;">
                  <strong style="color:#5a6478;font-size:0.85rem;">Subject</strong>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f2f7;color:#1a1a2e;">
                  ${subject || "General Enquiry"}
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;">
                  <strong style="color:#5a6478;font-size:0.85rem;">Message</strong>
                </td>
                <td style="padding:10px 0;color:#1a1a2e;line-height:1.6;">
                  ${message.replace(/\n/g, "<br>")}
                </td>
              </tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#f7f8fc;border-radius:8px;border-left:4px solid #ECB344;">
              <p style="margin:0;font-size:0.85rem;color:#5a6478;">
                💡 Reply directly to this email to respond to ${firstName} — their address is set as the reply-to.
              </p>
            </div>
          </div>
          <p style="text-align:center;color:#5a6478;font-size:0.75rem;margin-top:16px;">
            Sent from the First Connections website contact form
          </p>
        </div>
      `
    })
  });
 
  if (emailResponse.status === 201 || emailResponse.ok) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } else {
    const errorBody = await emailResponse.json().catch(() => ({}));
    console.error("Brevo email error:", JSON.stringify(errorBody));
    return {
      statusCode: emailResponse.status,
      body: JSON.stringify({ error: errorBody })
    };
  }
};
