
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validatePasswordComplexity } from '@/utils/security';
import { validateSecureEmail, sanitizeInput } from '@/utils/secureInput';
import { useSecureForm } from '@/hooks/useSecureForm';
import { AlertCircle } from 'lucide-react';

interface SignupFormProps {
  onSignup: (email: string, password: string, fullName: string) => Promise<void>;
  isLoading: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, isLoading }) => {
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    confirmPassword: '' 
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');
  const { secureSubmit } = useSecureForm();

  const validatePassword = (password: string) => {
    const validation = validatePasswordComplexity(password);
    setPasswordErrors(validation.errors);
    return validation.isValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setSignupData(prev => ({ ...prev, email }));
    
    if (email) {
      const validation = validateSecureEmail(email);
      setEmailError(validation.isValid ? '' : validation.error || '');
    } else {
      setEmailError('');
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedName = sanitizeInput(e.target.value);
    setSignupData(prev => ({ ...prev, fullName: sanitizedName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateSecureEmail(signupData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      return;
    }

    if (!validatePassword(signupData.password)) {
      return;
    }

    await secureSubmit(
      signupData,
      async (sanitizedData) => {
        await onSignup(sanitizedData.email, sanitizedData.password, sanitizedData.fullName);
      },
      'signup-form'
    );
  };

  const hasErrors = passwordErrors.length > 0 || !!emailError;
  const isFormValid = signupData.email && signupData.password && signupData.fullName && 
                     signupData.confirmPassword && !hasErrors;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          type="text"
          value={signupData.fullName}
          onChange={handleFullNameChange}
          required
          disabled={isLoading}
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={signupData.email}
          onChange={handleEmailChange}
          required
          disabled={isLoading}
          className={emailError ? 'border-red-500' : ''}
        />
        {emailError && (
          <p className="text-sm text-red-600">{emailError}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={signupData.password}
          onChange={(e) => {
            setSignupData(prev => ({ ...prev, password: e.target.value }));
            validatePassword(e.target.value);
          }}
          required
          disabled={isLoading}
        />
        {passwordErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={signupData.confirmPassword}
          onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
          disabled={isLoading}
          className={signupData.password && signupData.confirmPassword && 
                     signupData.password !== signupData.confirmPassword ? 'border-red-500' : ''}
        />
        {signupData.password && signupData.confirmPassword && 
         signupData.password !== signupData.confirmPassword && (
          <p className="text-sm text-red-600">Passwords do not match</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignupForm;
