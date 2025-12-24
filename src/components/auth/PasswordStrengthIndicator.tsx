import React from 'react';
import { calculatePasswordStrength } from '@/utils/passwordValidation';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showFeedback = true,
}) => {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index <= strength.score
                ? strength.color
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Password strength:{' '}
          <span
            className={cn(
              'font-medium',
              strength.score >= 3 ? 'text-green-600' : 
              strength.score >= 2 ? 'text-yellow-600' : 'text-destructive'
            )}
          >
            {strength.label}
          </span>
        </span>
      </div>

      {/* Feedback */}
      {showFeedback && strength.feedback.length > 0 && strength.score < 3 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-muted-foreground">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
