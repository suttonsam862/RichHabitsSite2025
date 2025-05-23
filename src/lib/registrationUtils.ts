/**
 * Utilities for managing event registration flow
 * This helps coordinate between the different steps of registration
 * and allows for better error recovery and state persistence.
 */

// Track global registration state
const STORAGE_KEYS = {
  REGISTRATION_DATA: 'registration_form_data',
  FALLBACK_URL: 'shopify_fallback_url',
  REGISTRATION_STATUS: 'registration_status',
  COMPLETED_EVENTS: 'completed_registrations'
};

// Registration status tracking for analytics and recovery
export type RegistrationStatus = {
  eventId: number;
  step: 'form' | 'submitted' | 'processing' | 'checkout' | 'complete' | 'error';
  timestamp: string;
  error?: string;
};

/**
 * Track the current step in the registration process
 */
export function updateRegistrationStatus(eventId: number, step: RegistrationStatus['step'], error?: string): void {
  try {
    const status: RegistrationStatus = {
      eventId,
      step,
      timestamp: new Date().toISOString(),
      ...(error && { error })
    };
    
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_STATUS, JSON.stringify(status));
    
    // If complete, also add to completed events
    if (step === 'complete') {
      markEventRegistrationComplete(eventId);
    }
  } catch (e) {
    console.warn('Could not update registration status:', e);
  }
}

/**
 * Get the current registration status from localStorage
 */
export function getRegistrationStatus(): RegistrationStatus | null {
  try {
    const savedStatus = localStorage.getItem(STORAGE_KEYS.REGISTRATION_STATUS);
    return savedStatus ? JSON.parse(savedStatus) : null;
  } catch (e) {
    console.warn('Could not retrieve registration status:', e);
    return null;
  }
}

/**
 * Mark an event registration as completed
 */
export function markEventRegistrationComplete(eventId: number): void {
  try {
    // Get current completed events
    const completedEvents = getCompletedRegistrations();
    
    // Add this event if not already in the list
    if (!completedEvents.includes(eventId)) {
      completedEvents.push(eventId);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_EVENTS, JSON.stringify(completedEvents));
    }
    
    // Clear the temporary registration data
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_DATA);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_STATUS);
  } catch (e) {
    console.warn('Could not mark event registration as complete:', e);
  }
}

/**
 * Get a list of events that the user has successfully registered for
 */
export function getCompletedRegistrations(): number[] {
  try {
    const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED_EVENTS);
    return completed ? JSON.parse(completed) : [];
  } catch (e) {
    console.warn('Could not retrieve completed registrations:', e);
    return [];
  }
}

/**
 * Detect whether user has an in-progress registration for an event
 */
export function hasInProgressRegistration(eventId: number): boolean {
  const status = getRegistrationStatus();
  if (!status) return false;
  
  // Only consider it in progress if it's for this event and started within the last 24 hours
  if (status.eventId !== eventId) return false;
  
  // Check if it's recent (within 24 hours)
  const statusTime = new Date(status.timestamp).getTime();
  const now = new Date().getTime();
  const isRecent = (now - statusTime) < (24 * 60 * 60 * 1000); // 24 hours
  
  // It's in progress if it's recent and not in the complete or error state
  return isRecent && status.step !== 'complete' && status.step !== 'error';
}

/**
 * For completed registrations, track in analytics and show appropriate messaging
 */
export function trackCheckoutCompleted(eventId: number): void {
  try {
    // Update status to complete
    updateRegistrationStatus(eventId, 'complete');
    
    // Clear fallback URL as it's no longer needed
    localStorage.removeItem(STORAGE_KEYS.FALLBACK_URL);
    
    // Could add analytics tracking here
    console.log('Checkout completed for event ID:', eventId);
  } catch (e) {
    console.warn('Could not track checkout completion:', e);
  }
}

/**
 * Custom error types to handle specific registration scenarios
 */
export enum RegistrationErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  PAYMENT = 'payment',
  SERVER = 'server',
  SHOPIFY = 'shopify',
  UNKNOWN = 'unknown'
}

/**
 * Extended error interface with additional information for registration errors
 */
export interface RegistrationError {
  message: string;
  type: RegistrationErrorType;
  eventId?: number;
  recoverable: boolean;
  suggestedAction?: string;
  technicalDetails?: string;
}

/**
 * Create a structured registration error
 */
export function createRegistrationError(
  message: string,
  type: RegistrationErrorType = RegistrationErrorType.UNKNOWN,
  recoverable: boolean = true,
  suggestedAction?: string,
  technicalDetails?: string
): RegistrationError {
  return {
    message,
    type,
    recoverable,
    suggestedAction,
    technicalDetails
  };
}

/**
 * Handle errors in the registration process
 */
export function handleRegistrationError(eventId: number, error: Error | string | RegistrationError): void {
  let processedError: RegistrationError;
  
  if (typeof error === 'string') {
    // Create structured error from string
    processedError = createRegistrationError(error);
  } else if ((error as RegistrationError).type !== undefined) {
    // Already a RegistrationError
    processedError = error as RegistrationError;
  } else {
    // Standard Error object
    const errorMessage = error.message;
    
    // Determine error type based on message content
    let errorType = RegistrationErrorType.UNKNOWN;
    let recoverable = true;
    let suggestedAction: string | undefined;
    
    // Network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('ECONNREFUSED')
    ) {
      errorType = RegistrationErrorType.NETWORK;
      suggestedAction = 'Please check your internet connection and try again.';
    }
    // Timeout errors
    else if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('timed out')
    ) {
      errorType = RegistrationErrorType.TIMEOUT;
      suggestedAction = 'The request took too long to complete. Please try again.';
    }
    // Shopify-specific errors
    else if (
      errorMessage.includes('shopify') ||
      errorMessage.includes('checkout') ||
      errorMessage.includes('variant') ||
      errorMessage.includes('cart')
    ) {
      errorType = RegistrationErrorType.SHOPIFY;
      suggestedAction = 'There was an issue connecting to our payment provider. Please try the alternate checkout method.';
    }
    // Create structured error
    processedError = createRegistrationError(errorMessage, errorType, recoverable, suggestedAction);
  }
  
  // Add event ID to the error if not already present
  processedError.eventId = eventId;
  
  // Update status to error
  updateRegistrationStatus(eventId, 'error', processedError.message);
  
  // Store detailed error info in session storage
  try {
    sessionStorage.setItem('last_registration_error', JSON.stringify(processedError));
  } catch (e) {
    console.warn('Could not store detailed error information:', e);
  }
  
  // Log the error for debugging
  console.error('Registration error:', processedError);
}

/**
 * Get the last registration error if available
 */
export function getLastRegistrationError(): RegistrationError | null {
  try {
    const errorJson = sessionStorage.getItem('last_registration_error');
    return errorJson ? JSON.parse(errorJson) : null;
  } catch (e) {
    console.warn('Could not retrieve last registration error:', e);
    return null;
  }
}

/**
 * Clear the last registration error
 */
export function clearLastRegistrationError(): void {
  try {
    sessionStorage.removeItem('last_registration_error');
  } catch (e) {
    console.warn('Could not clear last registration error:', e);
  }
}
