
import { Resend } from "npm:resend@2.0.0";

export async function sendWorkOrderEmail(
  workOrder: any,
  emailContent: string,
  resendApiKey: string
): Promise<void> {
  const resend = new Resend(resendApiKey);

  const response = await resend.emails.send({
    from: 'Moxie Vacation Rentals <team@moxievacationrentals.com>',
    to: [workOrder.contractor.email],
    subject: `New Work Order: ${workOrder.work_order_number} - ${workOrder.title}`,
    html: emailContent,
  });

  if (response.error) {
    console.error('Resend error:', response.error);
    throw new Error(`Failed to send email: ${response.error.message}`);
  }
}
