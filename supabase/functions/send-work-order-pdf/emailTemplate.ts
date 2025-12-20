
export function generateWorkOrderEmailContent(workOrder: any, acknowledgeUrl?: string, portalUrl?: string): string {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#f97316',
    critical: '#ef4444'
  };

  const priorityColor = priorityColors[workOrder.priority as keyof typeof priorityColors] || '#6b7280';

  // Combine description sections into one
  const hasDescriptionContent = workOrder.description || workOrder.scope_of_work || workOrder.special_instructions;
  
  const descriptionSections = [];
  if (workOrder.description) {
    descriptionSections.push(`<strong>Description:</strong> ${workOrder.description.replace(/\n/g, '<br>')}`);
  }
  if (workOrder.scope_of_work) {
    descriptionSections.push(`<strong>Scope:</strong> ${workOrder.scope_of_work.replace(/\n/g, '<br>')}`);
  }
  if (workOrder.special_instructions) {
    descriptionSections.push(`<strong>⚠️ Instructions:</strong> ${workOrder.special_instructions.replace(/\n/g, '<br>')}`);
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Order: ${workOrder.work_order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.5;
          color: #1f2937;
          background: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 10px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .header {
          background: #ffffff;
          padding: 20px;
          text-align: center;
          border-bottom: 3px solid #3b82f6;
        }
        .logo { font-size: 22px; font-weight: 700; color: #1f2937; }
        .wo-badge {
          display: inline-block;
          background: #f0f9ff;
          padding: 6px 14px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid #3b82f6;
          color: #1e40af;
          margin-top: 8px;
        }
        .content { padding: 20px; }
        .greeting {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 16px;
        }
        .details-grid {
          display: table;
          width: 100%;
          border-collapse: collapse;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }
        .details-row {
          display: table-row;
        }
        .detail-cell {
          display: table-cell;
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
          width: 50%;
        }
        .detail-cell:first-child {
          border-right: 1px solid #e2e8f0;
        }
        .detail-label {
          font-size: 10px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }
        .priority-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          color: white;
          background: ${priorityColor};
        }
        .description-box {
          background: #fffbeb;
          border-left: 3px solid #f59e0b;
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 4px;
          font-size: 13px;
        }
        .description-box p {
          margin-bottom: 8px;
        }
        .description-box p:last-child {
          margin-bottom: 0;
        }
        .actions {
          text-align: center;
          padding: 16px 0;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
        }
        .btn-primary {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
        }
        .btn-secondary {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          margin-top: 10px;
        }
        .footer {
          background: #f8fafc;
          padding: 16px 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: #3b82f6;
          text-decoration: none;
        }
        .confirm-note {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Moxie Vacation Rentals</div>
          <div class="wo-badge">${workOrder.work_order_number}</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hi ${workOrder.contractor?.name || 'Contractor'}, you have a new work order. Please review and confirm receipt.
          </div>

          <!-- Work Order Details Grid -->
          <div class="details-grid">
            <div class="details-row">
              <div class="detail-cell">
                <div class="detail-label">📝 Title</div>
                <div class="detail-value">${workOrder.title}</div>
              </div>
              <div class="detail-cell">
                <div class="detail-label">⚡ Priority</div>
                <span class="priority-badge">${workOrder.priority}</span>
              </div>
            </div>
            ${workOrder.property ? `
            <div class="details-row">
              <div class="detail-cell">
                <div class="detail-label">🏠 Property</div>
                <div class="detail-value">${workOrder.property.title}</div>
              </div>
              <div class="detail-cell">
                <div class="detail-label">📍 Location</div>
                <div class="detail-value" style="font-size: 12px;">${workOrder.property.location || 'N/A'}</div>
              </div>
            </div>
            ` : ''}
            <div class="details-row">
              ${workOrder.estimated_completion_date ? `
              <div class="detail-cell">
                <div class="detail-label">📅 Due Date</div>
                <div class="detail-value">${formatDate(workOrder.estimated_completion_date)}</div>
              </div>
              ` : '<div class="detail-cell"></div>'}
              ${workOrder.access_code ? `
              <div class="detail-cell">
                <div class="detail-label">🔑 Access Code</div>
                <div class="detail-value">${workOrder.access_code}</div>
              </div>
              ` : '<div class="detail-cell"></div>'}
            </div>
          </div>

          ${hasDescriptionContent ? `
          <div class="description-box">
            ${descriptionSections.map(section => `<p>${section}</p>`).join('')}
          </div>
          ` : ''}

          <!-- Action Buttons - AFTER work order details -->
          ${acknowledgeUrl ? `
          <div class="actions">
            <a href="${acknowledgeUrl}" class="btn-primary" style="display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; text-decoration: none;">✓ Acknowledge Receipt</a>
            ${portalUrl ? `<br><a href="${portalUrl}" class="btn-secondary" style="display: inline-block; background: #3b82f6; color: #ffffff !important; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none; margin-top: 10px;">📋 View My Work Orders</a>` : ''}
            <p class="confirm-note">Please confirm within 24 hours</p>
          </div>
          ` : `
          <div class="actions">
            <p style="font-size: 13px; color: #4b5563;"><strong>Please reply to this email</strong> to confirm receipt.</p>
          </div>
          `}
        </div>

        <div class="footer">
          📞 <a href="tel:+15412551698">541-255-1698</a> &nbsp;|&nbsp; 
          ✉️ <a href="mailto:team@moxievacationrentals.com">team@moxievacationrentals.com</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
