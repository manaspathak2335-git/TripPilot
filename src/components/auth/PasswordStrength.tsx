import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { PasswordStrength as PasswordStrengthType } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number;
  level: 'weak' | 'medium' | 'strong';
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function calculateStrength(password: string): StrengthResult {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lowercase) score++;
  if (checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  let level: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) level = 'strong';
  else if (score >= 3) level = 'medium';

  return { score, level, checks };
}

export function getPasswordStrength(password: string): PasswordStrengthType {
  const result = calculateStrength(password);
  return result.level;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  const strengthColors = {
    weak: 'bg-strength-weak',
    medium: 'bg-strength-medium',
    strong: 'bg-strength-strong',
  };

  const strengthText = {
    weak: 'Weak password',
    medium: 'Medium strength',
    strong: 'Strong password',
  };

  const requirements = [
    { key: 'length', label: 'At least 8 characters', met: strength.checks.length },
    { key: 'lowercase', label: 'Lowercase letter', met: strength.checks.lowercase },
    { key: 'uppercase', label: 'Uppercase letter', met: strength.checks.uppercase },
    { key: 'number', label: 'Number', met: strength.checks.number },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3"
    >
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((segment) => (
            <motion.div
              key={segment}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: segment * 0.1 }}
              className={cn(
                'h-1.5 flex-1 rounded-full origin-left transition-colors duration-300',
                segment <= (strength.level === 'weak' ? 1 : strength.level === 'medium' ? 2 : 3)
                  ? strengthColors[strength.level]
                  : 'bg-border'
              )}
            />
          ))}
        </div>
        <p className={cn(
          'text-xs font-medium',
          strength.level === 'weak' && 'text-strength-weak',
          strength.level === 'medium' && 'text-strength-medium',
          strength.level === 'strong' && 'text-strength-strong'
        )}>
          {strengthText[strength.level]}
        </p>
      </div>

      {/* Requirements list */}
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req) => (
          <motion.div
            key={req.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn(
              'text-xs',
              req.met ? 'text-foreground/80' : 'text-muted-foreground'
            )}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
