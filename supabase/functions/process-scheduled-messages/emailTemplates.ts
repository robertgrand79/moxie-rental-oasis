// Beautiful HTML email templates for guest communications

export function generateBookingConfirmationEmail(variables: Record<string, string>): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Booking Confirmed!</h1>
              <p style="margin: 10px 0 0; color: #ccfbf1; font-size: 16px;">Your reservation is all set</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 25px; color: #27272a; font-size: 18px;">
                Hi <strong>${variables.guest_name || 'Guest'}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Thank you for your reservation! We're excited to host you at <strong>${variables.property_name || 'our property'}</strong>. Here are your booking details:
              </p>
              
              <!-- Booking Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f5; border-radius: 10px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    
                    <!-- Property Name -->
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                      <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Property</p>
                      <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600;">${variables.property_name || 'Property'}</p>
                    </div>
                    
                    <!-- Dates Row -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                      <tr>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Check-in</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.check_in_date || 'TBD'}</p>
                          <p style="margin: 5px 0 0; color: #0d9488; font-size: 14px; font-weight: 500;">${variables.check_in_time || '4:00 PM'}</p>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Check-out</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.check_out_date || 'TBD'}</p>
                          <p style="margin: 5px 0 0; color: #0d9488; font-size: 14px; font-weight: 500;">${variables.check_out_time || '11:00 AM'}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Guests & Nights Row -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                      <tr>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Guests</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.guest_count || '1'} ${parseInt(variables.guest_count || '1') === 1 ? 'Guest' : 'Guests'}</p>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.nights_count || '1'} ${parseInt(variables.nights_count || '1') === 1 ? 'Night' : 'Nights'}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Total & Confirmation -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total Paid</p>
                          <p style="margin: 0; color: #0d9488; font-size: 22px; font-weight: 700;">$${variables.total_amount || '0.00'}</p>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation #</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600; font-family: monospace;">${variables.confirmation_code || 'N/A'}</p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              
              <!-- Address Section -->
              ${variables.property_address ? `
              <div style="margin-bottom: 30px; padding: 20px; background-color: #f0fdfa; border-radius: 10px; border-left: 4px solid #0d9488;">
                <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Property Address</p>
                <p style="margin: 0; color: #18181b; font-size: 16px;">${variables.property_address}</p>
                <a href="https://maps.google.com/?q=${encodeURIComponent(variables.property_address)}" style="display: inline-block; margin-top: 10px; color: #0d9488; font-size: 14px; text-decoration: none;">View on Google Maps →</a>
              </div>
              ` : ''}
              
              <!-- What's Next Section -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #18181b; font-size: 18px; font-weight: 600;">What's Next?</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.8;">
                  <li>You'll receive check-in instructions 24 hours before your arrival</li>
                  <li>Access your digital guidebook with property details and local recommendations</li>
                  <li>Contact us anytime if you have questions</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              ${variables.guidebook_link ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${variables.guidebook_link}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">View Property Guidebook</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #27272a; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #a1a1aa; font-size: 14px;">
                Questions about your stay?
              </p>
              <p style="margin: 0 0 20px;">
                <a href="mailto:stay@moxieproperties.com" style="color: #5eead4; text-decoration: none; font-size: 14px;">stay@moxieproperties.com</a>
              </p>
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} Moxie Properties. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateGenericEmail(subject: string, content: string, variables: Record<string, string>): string {
  // Convert plain text to HTML with line breaks
  const htmlContent = content.replace(/\n/g, "<br>");
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Moxie Properties</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              <div style="color: #27272a; font-size: 16px; line-height: 1.7;">
                ${htmlContent}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #27272a; padding: 25px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px;">
                <a href="mailto:stay@moxieproperties.com" style="color: #5eead4; text-decoration: none; font-size: 14px;">stay@moxieproperties.com</a>
              </p>
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} Moxie Properties. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
