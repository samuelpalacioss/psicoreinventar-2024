import NewPasswordForm from '@/components/new-password-form';
import { Suspense } from 'react';

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordForm />
    </Suspense>
  );
}
