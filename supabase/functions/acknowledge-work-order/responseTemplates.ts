
export function getSuccessPage(workOrder: any, alreadyAcknowledged: boolean) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Order ${alreadyAcknowledged ? 'Previously ' : ''}Acknowledged - Moxie Vacation Rentals</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .container {
          background: #ffffff;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          animation: slideUp 0.6s ease-out;
          border: 1px solid #e2e8f0;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkmarkAnimation {
          0% {
            transform: scale(0) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(45deg);
            opacity: 1;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
          }
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          position: relative;
          animation: pulseGlow 2s infinite;
        }
        
        .checkmark {
          color: white;
          font-size: 40px;
          font-weight: bold;
          animation: checkmarkAnimation 0.8s ease-out 0.3s both;
        }
        
        .brand-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .brand-logo {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .brand-tagline {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        h1 {
          color: #1f2937;
          text-align: center;
          margin-bottom: 16px;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 40px;
          font-size: 18px;
          font-weight: 400;
        }
        
        .work-order-details {
          background: #f8fafc;
          border-radius: 12px;
          padding: 32px;
          margin: 32px 0;
          border: 1px solid #e2e8f0;
        }
        
        .details-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .details-title::before {
          content: '📋';
          font-size: 20px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .value {
          color: #1f2937;
          font-weight: 500;
          font-size: 16px;
        }
        
        .status-badge {
          background: #10b981;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }
        
        .next-steps {
          background: #ffffff;
          border: 2px solid #3b82f6;
          border-left: 6px solid #3b82f6;
          padding: 24px;
          margin: 32px 0;
          border-radius: 8px;
          position: relative;
        }
        
        .next-steps::before {
          content: '🚀';
          position: absolute;
          top: -8px;
          right: 20px;
          font-size: 24px;
        }
        
        .next-steps h4 {
          color: #1f2937;
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .next-steps ul {
          margin: 0;
          padding-left: 24px;
          color: #374151;
        }
        
        .next-steps li {
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .contact-info {
          background: #f8fafc;
          padding: 32px;
          border-radius: 12px;
          text-align: center;
          margin-top: 40px;
          border: 1px solid #e2e8f0;
        }
        
        .contact-info-content {
          position: relative;
          z-index: 1;
        }
        
        .contact-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }
        
        .contact-details {
          background: #ffffff;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 12px 0;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .contact-item strong {
          color: #1f2937;
        }
        
        .contact-item a {
          color: #1f2937;
          text-decoration: none;
          font-weight: 600;
        }
        
        .contact-item a:hover {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .timestamp {
          background: #ffffff;
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin-top: 24px;
          border: 1px solid #e2e8f0;
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 32px 24px;
            margin: 10px;
          }
          
          h1 {
            font-size: 28px;
          }
          
          .success-icon {
            width: 64px;
            height: 64px;
          }
          
          .checkmark {
            font-size: 32px;
          }
          
          .work-order-details {
            padding: 24px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .contact-info {
            padding: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand-header">
          <div class="brand-logo">Moxie Vacation Rentals</div>
          <div class="brand-tagline">Your Home Base for Living Like a Local</div>
        </div>
        
        <div class="success-icon">
          <span class="checkmark">✓</span>
        </div>
        
        <h1>${alreadyAcknowledged ? 'Work Order Previously Acknowledged' : 'Work Order Acknowledged Successfully'}</h1>
        
        <p class="subtitle">
          ${alreadyAcknowledged 
            ? 'This work order has already been acknowledged.' 
            : 'Thank you for confirming receipt of this work order.'
          }
        </p>

        <div class="work-order-details">
          <div class="details-title">Work Order Details</div>
          
          <div class="detail-row">
            <span class="label">Work Order #</span>
            <span class="value">${workOrder.work_order_number}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Title</span>
            <span class="value">${workOrder.title}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Status</span>
            <span class="status-badge">Acknowledged</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Contractor</span>
            <span class="value">${workOrder.contractor?.name || 'Not assigned'}</span>
          </div>
        </div>

        ${!alreadyAcknowledged ? `
        <div class="next-steps">
          <h4>Next Steps</h4>
          <ul>
            <li>Review the work order details and requirements</li>
            <li>Contact the property manager if you have any questions</li>
            <li>Begin work according to the specified timeline</li>
            <li>Update the work order status when work is in progress</li>
          </ul>
        </div>
        ` : ''}

        <div class="contact-info">
          <div class="contact-info-content">
            <div class="contact-title">Questions about this work order?</div>
            <div class="contact-details">
              <div class="contact-item">
                <span>📞</span>
                <strong><a href="tel:+15412551698">+1 541-255-1698</a></strong>
              </div>
              <div class="contact-item">
                <span>✉️</span>
                <strong><a href="mailto:team@moxievacationrentals.com">team@moxievacationrentals.com</a></strong>
              </div>
              <div class="contact-item">
                <span>📍</span>
                <strong>2472 Willamette St, Eugene, OR 97405</strong>
              </div>
            </div>
            
            <div class="timestamp">
              Acknowledged on ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getErrorPage(message: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acknowledgement Error - Moxie Vacation Rentals</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .container {
          background: #ffffff;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          text-align: center;
          animation: slideUp 0.6s ease-out;
          border: 1px solid #e2e8f0;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .error-icon {
          width: 80px;
          height: 80px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
        }
        
        .x-mark {
          color: white;
          font-size: 40px;
          font-weight: bold;
        }
        
        .brand-header {
          margin-bottom: 32px;
        }
        
        .brand-logo {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .brand-tagline {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        h1 {
          color: #1f2937;
          margin-bottom: 20px;
          font-size: 32px;
          font-weight: 700;
        }
        
        p {
          color: #6b7280;
          margin-bottom: 30px;
          font-size: 18px;
        }
        
        .contact-info {
          background: #f8fafc;
          padding: 32px;
          border-radius: 12px;
          margin-top: 32px;
          border: 1px solid #e2e8f0;
        }
        
        .contact-info-content {
          position: relative;
          z-index: 1;
        }
        
        .contact-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1f2937;
        }
        
        .contact-details {
          background: #ffffff;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .contact-item {
          margin: 12px 0;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
        }
        
        .contact-item strong {
          color: #1f2937;
        }
        
        .contact-item a {
          color: #1f2937;
          text-decoration: none;
          font-weight: 600;
        }
        
        .contact-item a:hover {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 32px 24px;
            margin: 10px;
          }
          
          h1 {
            font-size: 28px;
          }
          
          .error-icon {
            width: 64px;
            height: 64px;
          }
          
          .x-mark {
            font-size: 32px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand-header">
          <div class="brand-logo">Moxie Vacation Rentals</div>
          <div class="brand-tagline">Your Home Base for Living Like a Local</div>
        </div>
        
        <div class="error-icon">
          <span class="x-mark">✕</span>
        </div>
        
        <h1>Acknowledgement Failed</h1>
        <p>${message}</p>
        
        <div class="contact-info">
          <div class="contact-info-content">
            <div class="contact-title">Need Help?</div>
            <div class="contact-details">
              <div class="contact-item">📞 <strong><a href="tel:+15412551698">+1 541-255-1698</a></strong></div>
              <div class="contact-item">✉️ <strong><a href="mailto:team@moxievacationrentals.com">team@moxievacationrentals.com</a></strong></div>
              <div class="contact-item">📍 <strong>2472 Willamette St, Eugene, OR 97405</strong></div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
