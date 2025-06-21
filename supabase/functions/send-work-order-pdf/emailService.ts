
interface SendGridEmail {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    subject: string;
  }>;
  from: {
    email: string;
    name: string;
  };
  content: Array<{
    type: string;
    value: string;
  }>;
}

export async function sendWorkOrderEmail(
  workOrder: any,
  emailContent: string,
  sendGridApiKey: string
): Promise<void> {
  const emailData: SendGridEmail = {
    personalizations: [{
      to: [{ 
        email: workOrder.contractor.email, 
        name: workOrder.contractor.name 
      }],
      subject: `New Work Order: ${workOrder.work_order_number} - ${workOrder.title}`
    }],
    from: {
      email: 'team@moxievacationrentals.com',
      name: 'Moxie Vacation Rentals'
    },
    content: [{
      type: 'text/html',
      value: emailContent
    }]
  };

  const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!sendGridResponse.ok) {
    const errorText = await sendGridResponse.text();
    console.error('SendGrid error:', errorText);
    throw new Error(`Failed to send email: ${sendGridResponse.status}`);
  }
}
