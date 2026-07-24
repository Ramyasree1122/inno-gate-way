import { UserLoginForm } from '@/features/auth/components/UserLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Inno Gateway',
  description: 'Sign in to your Inno Gateway account',
};

export default function UserLoginPage() {
  return <UserLoginForm />;
}
