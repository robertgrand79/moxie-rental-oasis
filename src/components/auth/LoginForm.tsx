
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateSecureEmail } from '@/utils/secureInput';
import { useSecureForm } from '@/hooks/useSecureForm';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const { secureSubmit } = useSecureForm();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setLoginData(prev => ({ ...prev, email }));
    
    if (email) {
      const validation = validateSecureEmail(email);
      setEmailError(validation.isValid ? '' : validation.error || '');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final email validation
    const emailValidation = validateSecureEmail(loginData.email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    await secureSubmit(
      loginData,
      async (sanitizedData) => {
        await onLogin(sanitizedData.email, sanitizedData.password);
      },
      'login-form'
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={loginData.email}
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
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
          required
          disabled={isLoading}
          minLength={8}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !!emailError || !loginData.email || !loginData.password}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;
