import { z } from "zod";
import { insertRegistrationSchema, strictRegistrationSchema } from "./schema";

// Export the unified registration schemas
export const registrationValidationSchema = strictRegistrationSchema;

// Keep backward compatibility exports
export const eventRegistrationValidationSchema = registrationValidationSchema;

// Specific validation schemas for different registration types
export const basicRegistrationSchema = insertRegistrationSchema.extend({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  contactName: z.string().nonempty("Parent/Guardian name is required"),
  email: z.string().email("Valid email is required"),
  eventId: z.number().positive("Event ID is required"),
  eventSlug: z.string().nonempty("Event slug is required"),
  medicalReleaseAccepted: z.boolean().refine(val => val === true, "Medical release must be accepted")
});

export const fullRegistrationSchema = basicRegistrationSchema.extend({
  phone: z.string().nonempty("Phone number is required"),
  grade: z.string().nonempty("Grade is required"),
  schoolName: z.string().nonempty("School name is required"),
  registrationType: z.enum(["full", "single"])
});

export type BasicRegistrationInput = z.infer<typeof basicRegistrationSchema>;
export type FullRegistrationInput = z.infer<typeof fullRegistrationSchema>;