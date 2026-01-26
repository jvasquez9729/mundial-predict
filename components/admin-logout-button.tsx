'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCsrfHeaders } from '@/lib/api/client'

export function AdminLogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getCsrfHeaders(),
      credentials: 'include',
    });
    window.location.href = '/';
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Salir
    </Button>
  );
}
