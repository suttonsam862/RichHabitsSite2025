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

// Event-specific schedules and information
const eventDetails = {
  'birmingham-slam-camp': {
    title: 'Birmingham Slam Camp',
    emoji: '🤼‍♂️',
    location: 'Clay-Chalkville Middle School, Birmingham, AL',
    dates: 'June 19-21, 2025',
    schedule: {
      'Day 1 (Thursday)': [
        '8:30 AM - Check-in & Registration',
        '9:00 AM - Opening Ceremony & Welcome',
        '9:30 AM - Technique Session: Basic Takedowns',
        '10:45 AM - Break',
        '11:00 AM - Live Wrestling & Drilling',
        '12:00 PM - Lunch Break',
        '1:00 PM - Mental Performance Workshop',
        '2:00 PM - Advanced Technique: Mat Wrestling',
        '3:15 PM - Conditioning & Fitness',
        '4:00 PM - Day 1 Wrap-up & Q&A'
      ],
      'Day 2 (Friday)': [
        '9:00 AM - Dynamic Warm-up',
        '9:30 AM - Technique Session: Escapes & Reversals',
        '10:45 AM - Break',
        '11:00 AM - Positional Wrestling',
        '12:00 PM - Lunch Break',
        '1:00 PM - Competition Strategy',
        '2:00 PM - Advanced Technique: Top Position',
        '3:15 PM - Strength & Conditioning',
        '4:00 PM - Day 2 Recap'
      ],
      'Day 3 (Saturday)': [
        '9:00 AM - Final Warm-up',
        '9:30 AM - Technique Review & Q&A',
        '10:30 AM - Practice Matches',
        '11:30 AM - Awards & Recognition',
        '12:00 PM - Closing Ceremony',
        '12:30 PM - Photos & Farewells'
      ]
    },
    whatToBring: [
      'Wrestling shoes (required)',
      'Athletic shorts (no pockets or zippers)',
      'Fitted t-shirt or wrestling singlet',
      'Water bottle (stays hydrated!)',
      'Towel for breaks',
      'Knee pads (optional but recommended)',
      'Headgear (if you have it)',
      'Change of clothes',
      'Lunch money or packed lunch',
      'Positive attitude and willingness to learn!'
    ],
    coachingStaff: [
      'NCAA Champions & Olympic-level athletes',
      'Rich Habits coaching team',
      'Special guest coaches'
    ]
  }
};

// Enhanced confirmation email with event details
export async function createEventConfirmationEmail(registrationData) {
  const { firstName, lastName, eventName, eventSlug, eventDates, eventLocation, registrationType, amount, paymentId, discountCode } = registrationData;
  
  const eventInfo = eventDetails[eventSlug] || {
    title: eventName,
    emoji: '🤼‍♂️',
    location: eventLocation,
    dates: eventDates,
    schedule: {
      'Camp Schedule': ['Full schedule details will be provided closer to the event date']
    },
    whatToBring: [
      'Wrestling shoes',
      'Athletic clothing',
      'Water bottle',
      'Positive attitude!'
    ],
    coachingStaff: ['Rich Habits coaching team']
  };

  const scheduleHtml = Object.entries(eventInfo.schedule).map(([day, activities]) => `
    <div style="margin-bottom: 20px;">
      <h4 style="color: #000000; font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">
        ${day}
      </h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${activities.map(activity => `<li style="color: #333333; margin-bottom: 5px;">${activity}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const whatToBringHtml = eventInfo.whatToBring.map(item => 
    `<li style="color: #333333; margin-bottom: 5px;">✓ ${item}</li>`
  ).join('');

  const subject = `${eventInfo.emoji} You're Registered! ${eventInfo.title} - Get Ready to DOMINATE!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${eventInfo.title} Registration Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
      <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
            ${eventInfo.emoji} Registration Confirmed! ${eventInfo.emoji}
          </h1>
          <p style="color: #cccccc; font-size: 18px; margin: 10px 0 0 0;">
            You're officially registered for ${eventInfo.title}
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 0 30px;">
          
          <!-- Excitement Section -->
          <div style="background-color: #f8f9fa; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 5px solid #28a745;">
            <h2 style="color: #000000; font-size: 22px; font-weight: bold; margin-bottom: 15px;">
              🔥 GET PUMPED, ${firstName.toUpperCase()}! 🔥
            </h2>
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              You're about to experience the MOST INTENSE wrestling training of your life! Our elite coaching staff is ready to take your skills to the next level. This isn't just a camp - it's your pathway to wrestling excellence!
            </p>
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin: 0;">
              <strong>Camper:</strong> ${firstName} ${lastName}<br>
              <strong>Event:</strong> ${eventInfo.title}<br>
              <strong>Dates:</strong> ${eventInfo.dates}<br>
              <strong>Location:</strong> ${eventInfo.location}
            </p>
          </div>

          <!-- Payment Confirmation -->
          <div style="background-color: #e8f5e8; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #28a745;">
            <h3 style="color: #155724; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
              ✅ Payment Confirmed
            </h3>
            <p style="color: #155724; margin: 0;">
              <strong>Amount Paid:</strong> $${amount}<br>
              <strong>Payment ID:</strong> ${paymentId}<br>
              <strong>Registration Type:</strong> ${registrationType}
              ${discountCode ? `<br><strong>Discount Applied:</strong> ${discountCode}` : ''}
            </p>
          </div>

          <!-- Camp Schedule -->
          <div style="margin: 30px 0;">
            <h2 style="color: #000000; font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center;">
              📅 YOUR CAMP SCHEDULE
            </h2>
            <div style="background-color: #ffffff; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px;">
              ${scheduleHtml}
            </div>
          </div>

          <!-- What to Bring -->
          <div style="margin: 30px 0;">
            <h2 style="color: #000000; font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center;">
              🎒 WHAT TO BRING
            </h2>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 25px;">
              <p style="color: #856404; font-size: 16px; font-weight: bold; margin-bottom: 15px;">
                Come prepared to DOMINATE! Here's your essential gear list:
              </p>
              <ul style="margin: 0; padding-left: 20px;">
                ${whatToBringHtml}
              </ul>
            </div>
          </div>

          <!-- Important Waiver Information -->
          <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #856404; font-size: 20px; font-weight: bold; margin-bottom: 15px; text-align: center;">
              📋 IMPORTANT: WAIVER REQUIRED
            </h3>
            <p style="color: #856404; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              <strong>Parents/Guardians:</strong> Please print, complete, and bring the attached liability waiver to camp check-in. This is REQUIRED for participation.
            </p>
            <div style="background-color: #ffffff; border: 1px solid #ffc107; border-radius: 4px; padding: 15px;">
              <p style="color: #856404; font-size: 14px; margin: 0;">
                ⚠️ <strong>No waiver = No participation</strong><br>
                📎 The waiver is attached to this email<br>
                🖨️ Print, sign, and bring to registration
              </p>
            </div>
          </div>

          <!-- Coaching Staff -->
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #000000; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
              🏆 Elite Coaching Staff
            </h3>
            <p style="color: #666666; font-size: 14px; margin: 0;">
              ${eventInfo.coachingStaff.join(' • ')}
            </p>
          </div>

          <!-- Final Motivation -->
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h3 style="color: #ffffff; font-size: 20px; font-weight: bold; margin-bottom: 10px;">
              🚀 Ready to Transform Your Wrestling?
            </h3>
            <p style="color: #ffffff; font-size: 16px; margin: 0;">
              Get your mind right, body ready, and prepare for the most intense wrestling experience of your life!
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e9ecef; margin-top: 30px;">
            <p style="color: #666666; font-size: 14px; margin: 0;">
              Questions? Contact us at <a href="mailto:info@rich-habits.com" style="color: #007bff;">info@rich-habits.com</a><br>
              Follow us for camp updates and wrestling tips!
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  const waiverContent = await getWaiverAttachment();
  
  return {
    to: registrationData.email,
    from: 'Rich Habits Wrestling <noreply@rich-habits.com>',
    subject,
    html,
    attachments: waiverContent ? [
      {
        filename: 'Summer-Wrestling-Camp-Waiver.jpg',
        content: waiverContent,
        type: 'image/jpeg',
        disposition: 'attachment'
      }
    ] : []
  };
}

// Function to get waiver as base64 attachment
async function getWaiverAttachment() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const waiverPath = path.join(process.cwd(), 'public', 'Summer-Wrestling-Camp-Waiver.jpg');
    const waiverBuffer = fs.readFileSync(waiverPath);
    return waiverBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading waiver file:', error);
    return null;
  }
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