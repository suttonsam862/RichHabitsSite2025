import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email templates
export function createIndividualConfirmationEmail(registrationData) {
  const {
    camperFirstName,
    camperLastName,
    parentName,
    campName,
    campDates,
    campLocation,
    eventId,
    amountPaid,
    gearIncluded,
    confirmationCode,
    parentEmail
  } = registrationData;

  const subject = `✅ You're All Set – ${camperFirstName}'s Registration for ${campName} is Confirmed!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Logo Header -->
        <div style="text-align: center; padding: 30px 0; background-color: #ffffff;">
          <img src="https://your-domain.com/images/rich-habits-logo.png" alt="Rich Habits" style="max-width: 200px; height: auto;">
        </div>

        <!-- Main Content -->
        <div style="padding: 0 30px;">
          
          <!-- Greeting -->
          <h1 style="color: #000000; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">
            Registration Confirmed!
          </h1>
          
          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Hi ${parentName},
          </p>
          
          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Thank you for registering ${camperFirstName} for our wrestling camp! We're excited to confirm that their registration has been successfully processed and payment received.
          </p>

          <!-- Registration Details -->
          <div style="background-color: #f8f9fa; padding: 25px; margin: 25px 0; border-radius: 8px;">
            <h2 style="color: #000000; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">
              Registration Details
            </h2>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Camper Name:</strong> ${camperFirstName} ${camperLastName}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Camp:</strong> ${campName}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Dates:</strong> ${campDates}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Location:</strong> ${campLocation}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Amount Paid:</strong> $${amountPaid}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Gear Included:</strong> ${gearIncluded ? 'Yes' : 'No'}
            </div>
            
            <div style="padding-bottom: 10px;">
              <strong style="color: #000000;">Confirmation Code:</strong> ${confirmationCode}
            </div>
          </div>

          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:admin@rich-habits.com" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
              Contact Support
            </a>
          </div>

          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            If you have any questions about the camp or need to make changes to your registration, simply reply to this email and we'll get back to you promptly.
          </p>

          <!-- Footer -->
          <div style="border-top: 1px solid #e9ecef; padding-top: 25px; margin-top: 40px;">
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin-bottom: 10px;">
              <strong>Legal Notice:</strong> This email confirms receipt of your payment and registration for Rich Habits Wrestling Camp. Please keep this confirmation for your records.
            </p>
            
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin-bottom: 25px;">
              If you did not make this registration, please contact our support team immediately at admin@rich-habits.com or +1 (480) 810-4477.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: parentEmail,
    cc: 'admin@rich-habits.com',
    from: 'admin@rich-habits.com',
    subject,
    html
  };
}

export function createTeamConfirmationEmail(teamRegistrationData) {
  const {
    teamContactName,
    teamName,
    numCampers,
    campName,
    campDates,
    campLocation,
    totalAmountPaid,
    gearIncluded,
    confirmationCode,
    teamContactEmail,
    campersList
  } = teamRegistrationData;

  const subject = `✅ Team Registration Confirmed – You're Locked In for ${campName}!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Registration Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Logo Header -->
        <div style="text-align: center; padding: 30px 0; background-color: #ffffff;">
          <img src="https://your-domain.com/images/rich-habits-logo.png" alt="Rich Habits" style="max-width: 200px; height: auto;">
        </div>

        <!-- Main Content -->
        <div style="padding: 0 30px;">
          
          <!-- Greeting -->
          <h1 style="color: #000000; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">
            Team Registration Confirmed!
          </h1>
          
          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Hi ${teamContactName},
          </p>
          
          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Thank you for bringing your team to our wrestling camp! We're excited to confirm that your team registration for <strong>${campName}</strong> has been received and fully processed. We appreciate you bringing a group to train with us.
          </p>

          <!-- Team Registration Summary -->
          <div style="background-color: #f8f9fa; padding: 25px; margin: 25px 0; border-radius: 8px;">
            <h2 style="color: #000000; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">
              Team Registration Summary
            </h2>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Team Contact:</strong> ${teamContactName}
            </div>
            
            ${teamName ? `
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Team Name:</strong> ${teamName}
            </div>
            ` : ''}
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Number of Campers:</strong> ${numCampers}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Camp:</strong> ${campName}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Dates:</strong> ${campDates}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Location:</strong> ${campLocation}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Total Amount Paid:</strong> $${totalAmountPaid}
            </div>
            
            <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 10px;">
              <strong style="color: #000000;">Gear Included:</strong> ${gearIncluded ? 'Yes - Individual gear packs for each camper' : 'No'}
            </div>
            
            <div style="padding-bottom: 10px;">
              <strong style="color: #000000;">Confirmation Code:</strong> ${confirmationCode}
            </div>
          </div>

          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Please review your team roster and reach out if you need to make any last-minute changes. All campers under this team registration will receive their individual gear packs at check-in.
          </p>

          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:admin@rich-habits.com?subject=Team Registration Review - ${confirmationCode}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
              Review Team Registration
            </a>
            <a href="mailto:admin@rich-habits.com?subject=Add Another Camper - ${confirmationCode}" style="display: inline-block; background-color: #ff6b35; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
              Add Another Camper
            </a>
          </div>

          <p style="color: #000000; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            If you have any questions about the camp or need assistance, simply reply to this email and we'll get back to you promptly.
          </p>

          <!-- Footer -->
          <div style="border-top: 1px solid #e9ecef; padding-top: 25px; margin-top: 40px;">
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin-bottom: 10px;">
              <strong>Legal Notice:</strong> This email serves as proof of payment and registration for your team at Rich Habits Wrestling Camp. Please keep this confirmation for your records.
            </p>
            
            <p style="color: #666666; font-size: 12px; line-height: 1.4; margin-bottom: 25px;">
              If you did not make this team registration, please contact our support team immediately at admin@rich-habits.com or +1 (480) 810-4477.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: teamContactEmail,
    cc: 'admin@rich-habits.com',
    from: 'admin@rich-habits.com',
    subject,
    html
  };
}

// Generic email sending function for simple confirmations
export async function sendConfirmationEmail({ to, subject, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const emailData = {
      to,
      from: 'noreply@rich-habits.com',
      subject,
      html
    };

    await sgMail.send(emailData);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}