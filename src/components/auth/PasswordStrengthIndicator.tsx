// components/auth/PasswordStrengthIndicator.tsx
import { checkPasswordStrength } from '@/lib/auth-utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

export function PasswordStrengthIndicator({ password, show = true }: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const { score, feedback, strength } = checkPasswordStrength(password);
  
  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  const strengthTexts = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength === 'weak' ? 'text-red-600' :
          strength === 'fair' ? 'text-orange-600' :
          strength === 'good' ? 'text-blue-600' : 'text-green-600'
        }`}>
          {strengthTexts[strength]}
        </span>
      </div>
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {feedback.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}