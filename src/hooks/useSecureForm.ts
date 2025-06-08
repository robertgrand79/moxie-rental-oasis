
import { useState } from 'react';
import { sanitizeFormData, ClientRateLimiter } from '@/utils/secureInput';
import { auditService } from '@/services/auditService';

const formRateLimiter = new ClientRateLimiter(10, 60 * 1000); // 10 submissions per minute

export const useSecureForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const secureSubmit = async (
    formData: any,
    submitAction: (sanitizedData: any) => Promise<any>,
    formIdentifier: string = 'generic-form'
  ) => {
    setIsSubmitting(true);

    try {
      // Rate limiting check
      if (!formRateLimiter.isAllowed(formIdentifier)) {
        await auditService.logSecurityEvent({
          action: 'form_rate_limit_exceeded',
          resource_type: 'form',
          success: false,
          details: { formIdentifier }
        });
        throw new Error('Too many submissions. Please wait before trying again.');
      }

      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData);

      // Log form submission attempt
      await auditService.logSecurityEvent({
        action: 'form_submission_attempt',
        resource_type: 'form',
        success: true,
        details: { formIdentifier }
      });

      // Execute the actual submission
      const result = await submitAction(sanitizedData);

      // Log successful submission
      await auditService.logSecurityEvent({
        action: 'form_submission_success',
        resource_type: 'form',
        success: true,
        details: { formIdentifier }
      });

      return result;

    } catch (error) {
      // Log failed submission
      await auditService.logSecurityEvent({
        action: 'form_submission_failed',
        resource_type: 'form',
        success: false,
        details: { 
          formIdentifier, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { secureSubmit, isSubmitting };
};
