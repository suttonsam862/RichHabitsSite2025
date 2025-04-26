import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

const ADMIN_EMAIL = 'admin@rich-habits.com';
const FROM_EMAIL = 'noreply@rich-habits.com';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface CustomApparelData {
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  sport: string;
  numberOfItems: number;
  timeframe: string;
  designIdeas: string;
}

interface EventRegistrationData {
  firstName: string;
  lastName: string;
  contactName: string;
  email: string;
  phone?: string;
  tShirtSize: string;
  grade: string;
  schoolName: string;
  clubName?: string;
  eventName: string;
  registrationType: string;
}

export async function sendContactFormEmail(data: ContactFormData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Can't send email: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    await mailService.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: `New Contact Form Submission: ${data.subject}`,
      text: `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject}

Message:
${data.message}
      `,
      html: `
<h1>New Contact Form Submission</h1>
<p><strong>Name:</strong> ${data.name}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
<p><strong>Subject:</strong> ${data.subject}</p>
<h2>Message:</h2>
<p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendCustomApparelInquiryEmail(data: CustomApparelData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Can't send email: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    await mailService.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: `New Custom Apparel Inquiry: ${data.organizationName}`,
      text: `
Organization: ${data.organizationName}
Contact Name: ${data.contactName}
Email: ${data.email}
Phone: ${data.phone}
Sport/Activity: ${data.sport}
Number of Items: ${data.numberOfItems}
Timeframe: ${data.timeframe}

Design Ideas:
${data.designIdeas}
      `,
      html: `
<h1>New Custom Apparel Inquiry</h1>
<p><strong>Organization:</strong> ${data.organizationName}</p>
<p><strong>Contact Name:</strong> ${data.contactName}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Phone:</strong> ${data.phone}</p>
<p><strong>Sport/Activity:</strong> ${data.sport}</p>
<p><strong>Number of Items:</strong> ${data.numberOfItems}</p>
<p><strong>Timeframe:</strong> ${data.timeframe}</p>
<h2>Design Ideas:</h2>
<p>${data.designIdeas.replace(/\n/g, '<br>')}</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendEventRegistrationEmail(data: EventRegistrationData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Can't send email: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    await mailService.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: `New Event Registration: ${data.eventName}`,
      text: `
Event: ${data.eventName}
Registration Type: ${data.registrationType}

Athlete Information:
First Name: ${data.firstName}
Last Name: ${data.lastName}
Grade: ${data.grade}
T-Shirt Size: ${data.tShirtSize}
School: ${data.schoolName}
Club: ${data.clubName || 'Not provided'}

Contact Information:
Contact Name: ${data.contactName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
      `,
      html: `
<h1>New Event Registration</h1>
<p><strong>Event:</strong> ${data.eventName}</p>
<p><strong>Registration Type:</strong> ${data.registrationType}</p>

<h2>Athlete Information:</h2>
<p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
<p><strong>Grade:</strong> ${data.grade}</p>
<p><strong>T-Shirt Size:</strong> ${data.tShirtSize}</p>
<p><strong>School:</strong> ${data.schoolName}</p>
<p><strong>Club:</strong> ${data.clubName || 'Not provided'}</p>

<h2>Contact Information:</h2>
<p><strong>Contact Name:</strong> ${data.contactName}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendNewsletterSubscriptionEmail(email: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Can't send email: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    await mailService.send({
      to: ADMIN_EMAIL,
      from: FROM_EMAIL,
      subject: 'New Newsletter Subscription',
      text: `New subscriber email: ${email}`,
      html: `<p>New subscriber email: <strong>${email}</strong></p>`,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}