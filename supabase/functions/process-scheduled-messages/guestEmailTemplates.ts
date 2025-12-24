// Guest-facing email templates for automated communications

export function generateCheckInReminderEmail(variables: Record<string, string>): string {
  const companyName = variables.company_name || 'Your Vacation Rental';
  const companyEmail = variables.company_email || '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Stay is Almost Here!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🌟 Your Stay is Almost Here!</h1>
              <p style="margin: 10px 0 0; color: #fef3c7; font-size: 16px;">Check-in reminder</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              
              <p style="margin: 0 0 25px; color: #27272a; font-size: 18px;">
                Hi <strong>${variables.guest_name || 'Guest'}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We're excited to welcome you to <strong>${variables.property_name || 'our property'}</strong> tomorrow! Here's a quick reminder of your upcoming stay:
              </p>
              
              <!-- Reminder Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Property</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.property_name || 'Property'}</p>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🕐 Check-in Time</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.check_in_time || '4:00 PM'}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 15px;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Check-in Date</p>
                          <p style="margin: 0; color: #f59e0b; font-size: 20px; font-weight: 700;">${variables.check_in_date || 'Tomorrow'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- What to Expect -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #18181b; font-size: 18px; font-weight: 600;">📋 What to Expect</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.8;">
                  <li>You'll receive detailed check-in instructions shortly</li>
                  <li>Access codes and entry information will be provided</li>
                  <li>The property will be ready for your arrival at ${variables.check_in_time || '4:00 PM'}</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              ${variables.guidebook_link ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${variables.guidebook_link}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">View Property Guidebook</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">
                Safe travels, and we look forward to hosting you!
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #27272a; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #a1a1aa; font-size: 14px;">
                Questions about your arrival?
              </p>
              ${companyEmail ? `
              <p style="margin: 0 0 20px;">
                <a href="mailto:${companyEmail}" style="color: #fbbf24; text-decoration: none; font-size: 14px;">${companyEmail}</a>
              </p>
              ` : ''}
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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

export function generateCheckOutReminderEmail(variables: Record<string, string>): string {
  const companyName = variables.company_name || 'Your Vacation Rental';
  const companyEmail = variables.company_email || '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-out Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Time to Check Out 🏠</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">We hope you enjoyed your stay!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              
              <p style="margin: 0 0 25px; color: #27272a; font-size: 18px;">
                Hi <strong>${variables.guest_name || 'Guest'}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Thank you for staying at <strong>${variables.property_name || 'our property'}</strong>! Your check-out is scheduled for today. Here's what you need to know:
              </p>
              
              <!-- Check-out Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #eef2ff; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #6366f1;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🕐 Check-out Time</p>
                          <p style="margin: 0; color: #6366f1; font-size: 24px; font-weight: 700;">${variables.check_out_time || '11:00 AM'}</p>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                          <p style="margin: 0 0 5px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Today</p>
                          <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 600;">${variables.check_out_date || 'Today'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Check-out Checklist -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #18181b; font-size: 18px; font-weight: 600;">✅ Check-out Checklist</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.8;">
                  <li>Please leave keys/key cards in the designated location</li>
                  <li>Run the dishwasher if dishes are dirty</li>
                  <li>Place used towels in the laundry area</li>
                  <li>Turn off lights and lock all doors</li>
                  <li>Ensure all windows are closed</li>
                </ul>
              </div>
              
              <div style="margin-bottom: 30px; padding: 20px; background-color: #f0fdf4; border-radius: 10px; border-left: 4px solid #22c55e;">
                <p style="margin: 0; color: #166534; font-size: 15px;">
                  <strong>💚 Thank you for being a wonderful guest!</strong><br>
                  We truly appreciate you choosing to stay with us.
                </p>
              </div>
              
              <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">
                Safe travels, and we hope to see you again soon!
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #27272a; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
              ${companyEmail ? `
              <p style="margin: 0 0 20px;">
                <a href="mailto:${companyEmail}" style="color: #818cf8; text-decoration: none; font-size: 14px;">${companyEmail}</a>
              </p>
              ` : ''}
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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

export function generateReviewRequestEmail(variables: Record<string, string>): string {
  const companyName = variables.company_name || 'Your Vacation Rental';
  const companyEmail = variables.company_email || '';
  const reviewUrl = variables.review_url || '#';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How was your stay?</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">How Was Your Stay? ⭐</h1>
              <p style="margin: 10px 0 0; color: #fce7f3; font-size: 16px;">We'd love your feedback</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              
              <p style="margin: 0 0 25px; color: #27272a; font-size: 18px;">
                Hi <strong>${variables.guest_name || 'Guest'}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We hope you had a wonderful time at <strong>${variables.property_name || 'our property'}</strong>! Your feedback means the world to us and helps future guests.
              </p>
              
              <!-- Star Rating Visual -->
              <div style="text-align: center; margin-bottom: 30px; padding: 30px; background-color: #fdf2f8; border-radius: 10px;">
                <p style="margin: 0 0 15px; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Share Your Experience</p>
                <p style="margin: 0; font-size: 40px;">⭐⭐⭐⭐⭐</p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${reviewUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: #ffffff; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 8px;">Leave a Review</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.6; text-align: center;">
                It only takes a minute and helps us improve!
              </p>
              
              <div style="margin-bottom: 30px; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
                <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
                  <strong>Stay Details:</strong><br>
                  ${variables.property_name}<br>
                  ${variables.check_in_date} → ${variables.check_out_date}
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #27272a; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #a1a1aa; font-size: 14px;">
                Thank you for being an amazing guest! 💖
              </p>
              ${companyEmail ? `
              <p style="margin: 0 0 20px;">
                <a href="mailto:${companyEmail}" style="color: #f472b6; text-decoration: none; font-size: 14px;">${companyEmail}</a>
              </p>
              ` : ''}
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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

export function generateCheckInInstructionsEmail(variables: Record<string, string>): string {
  const companyName = variables.company_name || 'Your Vacation Rental';
  const companyEmail = variables.company_email || '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in Instructions</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🔑 Check-in Instructions</h1>
              <p style="margin: 10px 0 0; color: #ccfbf1; font-size: 16px;">Everything you need to access ${variables.property_name || 'the property'}</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px;">
              
              <p style="margin: 0 0 25px; color: #27272a; font-size: 18px;">
                Hi <strong>${variables.guest_name || 'Guest'}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                The time has come! Here are your check-in instructions for <strong>${variables.property_name || 'your stay'}</strong>:
              </p>
              
              <!-- Check-in Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdfa; border-radius: 10px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 10px; color: #0d9488; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📅 Check-in Time</p>
                    <p style="margin: 0; color: #18181b; font-size: 20px; font-weight: 700;">${variables.check_in_date || 'Today'} at ${variables.check_in_time || '4:00 PM'}</p>
                  </td>
                </tr>
              </table>
              
              ${variables.property_address ? `
              <!-- Address -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f5; border-radius: 10px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 10px; color: #71717a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📍 Property Address</p>
                    <p style="margin: 0 0 15px; color: #18181b; font-size: 16px; line-height: 1.5;">${variables.property_address}</p>
                    <a href="https://maps.google.com/?q=${encodeURIComponent(variables.property_address)}" style="display: inline-block; padding: 10px 20px; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px;">Open in Google Maps</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              ${variables.door_code ? `
              <!-- Access Code -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🔐 Door Code</p>
                    <p style="margin: 0; color: #18181b; font-size: 32px; font-weight: 700; font-family: monospace; letter-spacing: 4px;">${variables.door_code}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              ${variables.wifi_network ? `
              <!-- WiFi Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #dbeafe; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 10px; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📶 WiFi Information</p>
                    <p style="margin: 0 0 5px; color: #18181b; font-size: 16px;"><strong>Network:</strong> ${variables.wifi_network}</p>
                    ${variables.wifi_password ? `<p style="margin: 0; color: #18181b; font-size: 16px;"><strong>Password:</strong> ${variables.wifi_password}</p>` : ''}
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA Button -->
              ${variables.guidebook_link ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${variables.guidebook_link}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">View Full Property Guide</a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">
                We hope you have an amazing stay! Don't hesitate to reach out if you have any questions.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #27272a; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #a1a1aa; font-size: 14px;">
                Need help? We're here for you!
              </p>
              ${companyEmail ? `
              <p style="margin: 0 0 20px;">
                <a href="mailto:${companyEmail}" style="color: #5eead4; text-decoration: none; font-size: 14px;">${companyEmail}</a>
              </p>
              ` : ''}
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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
