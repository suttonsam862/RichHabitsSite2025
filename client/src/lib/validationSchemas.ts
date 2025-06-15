import { z } from 'zod';

/**
 * Centralized validation schemas for forms
 */

// Common field schemas
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters');
const emailSchema = z.string().email('Please enter a valid email address');
const phoneSchema = z.string().regex(/^[+]?[1-9]?[0-9]{7,15}$/, 'Please enter a valid phone number');

// Event registration schemas
export const eventRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  age: z.coerce.number().min(8, 'Must be at least 8 years old').max(99, 'Please enter a valid age'),
  weight: z.coerce.number().min(50, 'Please enter a valid weight').max(400, 'Please enter a valid weight'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select an experience level'
  }),
  emergencyContact: nameSchema,
  emergencyPhone: phoneSchema,
  medicalConditions: z.string().optional(),
  parentConsent: z.boolean().refine(val => val === true, 'Parent consent is required for minors')
});

// Team registration schema
export const teamRegistrationSchema = z.object({
  coachName: nameSchema,
  coachEmail: emailSchema,
  coachPhone: phoneSchema,
  schoolName: z.string().min(2, 'School name is required'),
  teamName: z.string().min(2, 'Team name is required'),
  athletes: z.array(z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    age: z.coerce.number().min(8).max(25),
    weight: z.coerce.number().min(50).max(400),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'])
  })).min(1, 'At least one athlete is required').max(20, 'Maximum 20 athletes per team')
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters')
});

// Custom apparel inquiry schema
export const customApparelSchema = z.object({
  contactName: nameSchema,
  email: emailSchema,
  organization: z.string().min(2, 'Organization name is required'),
  itemType: z.enum(['shirts', 'shorts', 'hoodies', 'singlets', 'other'], {
    required_error: 'Please select an item type'
  }),
  quantity: z.coerce.number().min(12, 'Minimum order is 12 pieces').max(1000, 'Please contact us for orders over 1000 pieces'),
  description: z.string().min(10, 'Please provide more details about your requirements'),
  deadline: z.string().optional(),
  budget: z.string().optional()
});

export type EventRegistration = z.infer<typeof eventRegistrationSchema>;
export type TeamRegistration = z.infer<typeof teamRegistrationSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type CustomApparel = z.infer<typeof customApparelSchema>;