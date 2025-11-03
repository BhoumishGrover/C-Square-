import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '..//contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { logout as apiLogout } from '../lib/api';

const AUTH_STORAGE_KEYS = [
  'csquare_company_id',
  'csquare_company_slug',
  'csquare_company_name',
  'csquare_auth_provider',
  'csquare_role',
];

const getIsAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return AUTH_STORAGE_KEYS.some((key) => Boolean(localStorage.getItem(key)));
};

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

type NavItem =
  | { name: string; href: string; action?: undefined }
  | { name: string; action: 'logout'; href?: undefined };

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(getIsAuthenticated);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || AUTH_STORAGE_KEYS.includes(event.key)) {
        setIsAuthenticated(getIsAuthenticated());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setIsAuthenticated(getIsAuthenticated());
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Logout failed', err);
    } finally {
      clearAuthStorage();
      setIsAuthenticated(false);
      setIsMobileMenuOpen(false);
      navigate('/login');
    }
  }, [navigate]);

  const { primary, authAction } = useMemo(() => {
    const base: NavItem[] = [
      { name: 'Home', href: '/' },
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Explorer', href: '/explorer' },
      { name: 'Docs', href: '/docs' },
      { name: 'Contact', href: '/contact' },
    ];

    const isAdmin = localStorage.getItem('csquare_role') === 'admin';
    if (isAuthenticated && isAdmin) {
      base.push({ name: 'Admin', href: '/admin' });
    }

    const authItem: NavItem = isAuthenticated
      ? { name: 'Logout', action: 'logout' }
      : { name: 'Login', href: '/login' };

    return { primary: base, authAction: authItem };
  }, [isAuthenticated]);

  const isActive = (path?: string) => (path ? location.pathname === path : false);

  const renderNavItem = (item: NavItem, variant: 'desktop' | 'mobile') => {
    if (item.action === 'logout') {
      const className =
        variant === 'desktop'
          ? 'text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
          : 'text-sm font-medium px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-primary hover:bg-muted';

      return (
        <button key={item.name} type="button" onClick={handleLogout} className={className}>
          {item.name}
        </button>
      );
    }

    const active = isActive(item.href);
    const className =
      variant === 'desktop'
        ? `text-sm font-medium transition-colors hover:text-primary ${
            active ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
          }`
        : `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
            active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted'
          }`;

    return (
      <Link
        key={item.name}
        to={item.href}
        className={className}
        onClick={() => {
          if (variant === 'mobile') {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        {item.name}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">C²</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-foreground">CarbonLedger</span>
              <span className="text-xs text-muted-foreground -mt-1">Bye Buy Carbon</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {primary.map((item) => renderNavItem(item, 'desktop'))}
            {renderNavItem(authAction, 'desktop')}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {primary.map((item) => renderNavItem(item, 'mobile'))}
              {renderNavItem(authAction, 'mobile')}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
