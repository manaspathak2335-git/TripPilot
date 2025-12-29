import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AuthCard,
  AuthInput,
  AuthButton,
  OAuthButton,
  AuthLogo,
  AuthDivider,
  PasswordStrength,
} from '@/components/auth';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, loginWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextPath = params.get('next') || '/map';
  const openChat = params.get('openChat');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });
      toast({
        title: 'Account created!',
        description: 'Welcome to TripPilot. Your journey begins now.',
      });
      navigate(openChat ? `${nextPath}?openChat=1` : nextPath);
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Welcome!',
        description: 'Account created successfully with Google.',
      });
      navigate(openChat ? `${nextPath}?openChat=1` : nextPath);
    } catch (error) {
      toast({
        title: 'Google sign up failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center px-4 py-12">
      <AuthCard className="max-w-lg">
        <div className="space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-2">
            <AuthLogo size="lg" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-foreground mt-6">
                Join TripPilot Today
              </h1>
              <p className="text-muted-foreground mt-1">
                Create your account and start planning
              </p>
            </motion.div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              id="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="h-5 w-5" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <AuthInput
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-2">
              <AuthInput
                id="password"
                type="password"
                label="Password"
                placeholder="Create a strong password"
                icon={<Lock className="h-5 w-5" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrength password={password || ''} />
            </div>

            <AuthInput
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              icon={<Lock className="h-5 w-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm text-muted-foreground cursor-pointer leading-tight"
                >
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}
            </motion.div>

            <AuthButton
              type="submit"
              isLoading={isLoading}
              loadingText="Creating account..."
              className="mt-6"
            >
              Create Account
            </AuthButton>
          </form>

          {/* Divider */}
          <AuthDivider />

          {/* OAuth */}
          <OAuthButton
            provider="google"
            onClick={handleGoogleSignup}
            isLoading={isGoogleLoading}
          />

          {/* Sign In Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground"
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </AuthCard>
    </div>
  );
}
