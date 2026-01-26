"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, Menu, X, User, Bell, LogOut, Settings, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/hooks/use-translation";
import { motion, AnimatePresence } from "framer-motion";
import { getCsrfHeaders } from "@/lib/api/client";

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();

    // Cargar notificaciones si está autenticado
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  async function loadNotifications() {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: any) => !n.leida)?.length || 0);
      }
    } catch {
      // Silently fail
    }
  }

  function handleLogout() {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: getCsrfHeaders(),
      credentials: 'include',
    }).then(() => {
      router.push('/');
      router.refresh();
    });
  }

  const navItems = [
    { href: '/#clasificacion', label: t('nav.leaderboard'), id: 'leaderboard' },
    { href: '/predicciones', label: t('nav.predictions'), id: 'predictions' },
    { href: '/resultados', label: t('nav.results'), id: 'results' },
    { href: '/reglas', label: t('nav.rules'), id: 'rules' },
  ];

  const isActive = (href: string) => {
    if (href === '/#clasificacion') {
      return pathname === '/' || pathname.includes('clasificacion');
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary transition-transform hover:scale-105">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Mundial Predict
            </span>
            <span className="text-xs text-muted-foreground">Copa 2026</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Navegación principal">
          {navItems.map((item) => {
            if (item.href.startsWith('#')) {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`text-sm transition-colors ${
                    isActive(item.href) 
                      ? 'text-foreground bg-accent' 
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                  onClick={() => {
                    if (item.href === '/#clasificacion' && pathname === '/') {
                      document.getElementById('clasificacion')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      router.push('/');
                      setTimeout(() => {
                        document.getElementById('clasificacion')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            }
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-sm transition-colors ${
                    isActive(item.href) 
                      ? 'text-foreground bg-accent' 
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <>
              {/* Notificaciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative transition-all hover:bg-accent" aria-label={t('nav.notifications')}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">{t('nav.notifications')}</h4>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={async () => {
                            // Marcar todas como leídas
                            await fetch('/api/notifications', {
                              method: 'PUT',
                              headers: getCsrfHeaders(),
                              credentials: 'include',
                            });
                            loadNotifications();
                          }}
                        >
                          {t('common.markAllRead')}
                        </Button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {t('nav.noNotifications')}
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              !notif.leida ? 'bg-primary/10' : 'hover:bg-accent'
                            }`}
                            onClick={async () => {
                              if (!notif.leida) {
                                await fetch(`/api/notifications?id=${notif.id}`, {
                                  method: 'PUT',
                                  credentials: 'include',
                                });
                                loadNotifications();
                              }
                            }}
                          >
                            <p className="font-medium">{notif.titulo}</p>
                            <p className="text-muted-foreground">{notif.mensaje}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.creado_en).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/notificaciones" className="w-full">
                      {t('nav.viewAllNotifications')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Menú de Usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="transition-all hover:bg-accent" aria-label={t('nav.profile')}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2">
                    <p className="text-sm font-medium">{user?.nombre_completo || t('nav.user')}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/predicciones" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t('nav.myPredictions')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {t('nav.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  alert('Para registrarte, necesitas un link de registro único proporcionado por el administrador. Contacta al administrador para obtener tu link de registro.');
                }}
              >
                {t('nav.register')}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t('common.close') : t('common.open')}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border bg-background md:hidden overflow-hidden"
            role="navigation"
            aria-label="Navegación móvil"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                if (item.href.startsWith('#')) {
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (item.href === '/#clasificacion' && pathname === '/') {
                          document.getElementById('clasificacion')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          router.push('/');
                          setTimeout(() => {
                            document.getElementById('clasificacion')?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                }
                return (
                  <Link key={item.id} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {isAuthenticated && (
                <>
                  <div className="my-2 border-t border-border" />
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
