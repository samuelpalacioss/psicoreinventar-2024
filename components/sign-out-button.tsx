'use client';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
export default function SignOutButton() {
  return (
    <Button
      onClick={() => {
        signOut({
          callbackUrl: `${window.location.origin}/login`,
        });
      }}
    >
      Sign out
    </Button>
  );
}
