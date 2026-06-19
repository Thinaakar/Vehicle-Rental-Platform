'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Car, Eye, EyeOff, Lock, Mail, Shield, Store, User } from 'lucide-react';
import { useAuth, type LoginRole } from '@/context/AuthContext';
import { usePlatform } from '@/context/PlatformContext';
import { DEMO_CREDENTIALS } from '@/data/demo-accounts';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = DEMO_CREDENTIALS.admin.email.toLowerCase();

export default function LoginPage() {
  const { login } = useAuth();
  const { openMarketing, openDashboard } = usePlatform();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>('customer');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdminEmail = email.trim().toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!isAdminEmail && !selectedRole) {
      setError('Please select Customer or Vendor before signing in.');
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(email, password, isAdminEmail ? null : selectedRole);
    setLoading(false);

    if (result.success) {
      openDashboard();
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  const fillDemo = (type: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[type];
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');

    if (type === 'customer') setSelectedRole('customer');
    else if (type === 'vendor') setSelectedRole('vendor');
    else setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1220]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl shadow-slate-900/30 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight">
                    DriveX<span className="text-cyan-400">Pro</span>
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Enterprise Rental Platform
                  </p>
                </div>
              </div>

              <h1 className="mt-12 text-4xl font-black leading-tight tracking-tight">
                Premium mobility for operators, vendors, and customers.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                Access your role-based workspace with enterprise-grade fleet visibility, booking
                intelligence, and customer experience tools.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '500+', label: 'Vehicles' },
                { value: '50+', label: 'Cities' },
                { value: '4.9★', label: 'Rating' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-xl font-black">{item.value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 md:p-10">
            <button
              type="button"
              onClick={openMarketing}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to website
            </button>

            <div
              className={cn(
                'transition-all duration-500',
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
              )}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Secure Sign In</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to access your DriveXPro workspace.</p>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Address
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <RoleSelector
                  value={selectedRole}
                  onChange={setSelectedRole}
                  disabled={isAdminEmail}
                />

                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8">
                <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Quick demo access
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <DemoButton
                    label={DEMO_CREDENTIALS.admin.label}
                    icon={<Shield className="h-4 w-4" />}
                    onClick={() => fillDemo('admin')}
                    className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  />
                  <DemoButton
                    label={DEMO_CREDENTIALS.vendor.label}
                    icon={<Store className="h-4 w-4" />}
                    onClick={() => fillDemo('vendor')}
                    className="border-sky-200 text-sky-700 hover:bg-sky-50"
                  />
                  <DemoButton
                    label={DEMO_CREDENTIALS.customer.label}
                    icon={<User className="h-4 w-4" />}
                    onClick={() => fillDemo('customer')}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  />
                </div>
                <p className="mt-4 text-center text-xs text-slate-400">
                  Demo buttons fill credentials only. Click <strong>Sign In</strong> to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleSelector({
  value,
  onChange,
  disabled,
}: {
  value: LoginRole | null;
  onChange: (role: LoginRole) => void;
  disabled?: boolean;
}) {
  const options: { id: LoginRole; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: 'customer', label: 'Customer', icon: <User className="h-4 w-4" />, hint: 'Book & manage rentals' },
    { id: 'vendor', label: 'Vendor', icon: <Store className="h-4 w-4" />, hint: 'Fleet & booking ops' },
  ];

  return (
    <div className={cn('space-y-2', disabled && 'pointer-events-none opacity-50')}>
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        Sign in as
      </span>

      <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5">
        <div
          className={cn(
            'pointer-events-none absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/25 transition-all duration-300 ease-out',
            value === 'vendor' ? 'left-[calc(50%+3px)]' : 'left-1.5',
            !value && 'opacity-0',
          )}
          aria-hidden
        />

        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'relative z-10 flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-center transition-colors duration-300',
                active ? 'text-slate-950' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                  active ? 'bg-white/40 text-slate-900' : 'bg-white/60 text-slate-400',
                )}
              >
                {option.icon}
              </span>
              <span className="text-sm font-bold">{option.label}</span>
              <span className={cn('text-[10px] font-medium', active ? 'text-slate-800/80' : 'text-slate-400')}>
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DemoButton({
  label,
  icon,
  onClick,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold transition',
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}
