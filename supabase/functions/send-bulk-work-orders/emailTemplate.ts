export function generateBulkWorkOrderEmailContent(
  workOrders: any[],
  contractor: any,
  acknowledgeUrl: string
): string {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const priorityColors: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  const workOrdersHtml = workOrders.map((wo, index) => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 14px; font-weight: 600; color: #1f2937;">
            ${wo.work_order_number}
          </span>
          <span style="display: inline-block; margin-left: 8px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; background: ${priorityColors[wo.priority] || '#6b7280'};">
            ${wo.priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">${wo.title}</h3>
      
      ${wo.property ? `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #4b5563; font-size: 14px;">
        <span>🏠</span>
        <span><strong>Property:</strong> ${wo.property.title}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
        <span>📍</span>
        <span>${wo.property.location || 'No address'}</span>
      </div>
      ` : ''}
      
      ${wo.estimated_completion_date ? `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #4b5563; font-size: 14px;">
        <span>📅</span>
        <span><strong>Due:</strong> ${formatDate(wo.estimated_completion_date)}</span>
      </div>
      ` : ''}
      
      ${wo.description ? `
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Description</div>
        <div style="color: #1f2937; font-size: 14px; line-height: 1.6;">${wo.description.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}
      
      ${wo.scope_of_work ? `
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 16px; border-radius: 0 8px 8px 0;">
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">🔧 Scope of Work</div>
        <div style="color: #1f2937; font-size: 14px; line-height: 1.6;">${wo.scope_of_work.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}
      
      ${wo.access_code ? `
      <div style="background: #f0fdf4; padding: 12px 16px; border-radius: 8px; margin-top: 16px; border: 1px solid #86efac;">
        <span style="font-weight: 600; color: #166534;">🔑 Access Code:</span>
        <span style="font-family: monospace; font-size: 16px; color: #166534; margin-left: 8px;">${wo.access_code}</span>
      </div>
      ` : ''}
      
      ${wo.special_instructions ? `
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-top: 16px; border-radius: 0 8px 8px 0;">
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">⚠️ Special Instructions</div>
        <div style="color: #1f2937; font-size: 14px; line-height: 1.6;">${wo.special_instructions.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Orders for ${contractor.name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f8fafc; min-height: 100vh;">
      <div style="max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: #ffffff; color: #1f2937; padding: 40px 30px; text-align: center; border-bottom: 3px solid #3b82f6;">
          <div style="font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.025em; color: #1f2937;">Moxie Vacation Rentals</div>
          <div style="font-size: 16px; color: #6b7280; margin-bottom: 20px; font-weight: 400;">Your Home Base for Living Like a Local</div>
          <div style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 18px;">
            ${workOrders.length} Work Order${workOrders.length > 1 ? 's' : ''} Assigned
          </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px; background: #ffffff;">
          <div style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 16px; text-align: center;">
            Hello ${contractor.name}!
          </div>
          <div style="font-size: 18px; color: #4b5563; text-align: center; margin-bottom: 40px; line-height: 1.7;">
            We have ${workOrders.length > 1 ? `${workOrders.length} new work orders` : 'a new work order'} ready for you. Please review the details below.
          </div>

          <!-- Acknowledge Button -->
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${acknowledgeUrl}" 
               style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 18px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4);">
              ✓ Acknowledge Receipt
            </a>
            <p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
              Click to confirm you've received ${workOrders.length > 1 ? 'these work orders' : 'this work order'}
            </p>
          </div>

          <!-- Work Orders List -->
          <div style="margin-bottom: 30px;">
            ${workOrdersHtml}
          </div>
        </div>

        <!-- Contact Section -->
        <div style="background: #f8fafc; color: #1f2937; padding: 40px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #1f2937;">Need to Get in Touch?</div>
          <div style="background: #ffffff; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            <div style="margin: 12px 0; font-size: 16px; color: #1f2937;">
              <span>📞</span>
              <span><strong>Phone:</strong> <a href="tel:+15412551698" style="color: #1f2937; text-decoration: none; font-weight: 600;">+1 541-255-1698</a></span>
            </div>
            <div style="margin: 12px 0; font-size: 16px; color: #1f2937;">
              <span>✉️</span>
              <span><strong>Email:</strong> <a href="mailto:team@moxievacationrentals.com" style="color: #1f2937; text-decoration: none; font-weight: 600;">team@moxievacationrentals.com</a></span>
            </div>
            <div style="margin: 12px 0; font-size: 16px; color: #1f2937;">
              <span>📍</span>
              <span><strong>Address:</strong> 2472 Willamette St, Eugene, OR 97405</span>
            </div>
          </div>
          
          <div style="font-size: 14px; color: #6b7280; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p>This is an automated message from Moxie Vacation Rentals.</p>
            <p style="margin-top: 8px;">We're here to help make your work seamless and efficient.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
