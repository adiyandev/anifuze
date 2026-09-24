import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LockKeyhole } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function AdminLoginPage() {
  const nav = useNavigate();
  const { refreshAuth, toast } = useApp();
  const [step, setStep] = useState<'credentials' | '2fa' | 'setup'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<'totp' | 'email' | 'recovery'>('totp');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      if (step === 'credentials') {
        const response = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Login failed.');
        setStep(data.requires2fa ? 'setup' : '2fa');
        return;
      }

      let url = '/api/auth/admin/verify-2fa';
      if (method === 'email') url = '/api/auth/admin/2fa/email/verify';
      if (method === 'recovery') url = '/api/auth/admin/2fa/recovery/verify';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed.');
      await refreshAuth();
      nav('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  const sendEmail = async () => {
    const response = await fetch('/api/auth/admin/2fa/email/send', { method: 'POST' });
    const data = await response.json();
    if (data.developmentCode) setCode(data.developmentCode);
  };

  const setup = async () => {
    const response = await fetch('/api/auth/admin/2fa/setup', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '2FA setup failed.');
    setCode('');
    return data;
  };

  const enable = async () => {
    const response = await fetch('/api/auth/admin/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '2FA activation failed.');
    if (data.recoveryCodes) {
      window.prompt('Save your recovery codes', data.recoveryCodes.join('\n'));
    }
    setStep('2fa');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-logo">A</div>
          <div><strong>AniFuze</strong><small>ADMIN CONSOLE</small></div>
        </div>

        {step === 'credentials' ? (
          <>
            <div className="admin-login-icon"><LockKeyhole size={20} /></div>
            <h1>Sign in</h1>
            <p>Use your administrator account to continue.</p>
            <form onSubmit={submit}>
              <label>
                Email
                <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
              </label>
              <label>
                Password
                <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} minLength={12} required />
              </label>
              <button className="button admin-login-submit" type="submit">Continue</button>
            </form>
          </>
        ) : step === 'setup' ? (
          <>
            <div className="admin-login-icon"><ShieldCheck size={22} /></div>
            <h1>Set up 2FA</h1>
            <p>Your administrator account needs an authenticator before access is granted.</p>
            <button
              className="button"
              type="button"
              onClick={async () => {
                try {
                  const data = await setup();
                  setError('Authenticator secret generated. Copy it from the setup panel below.');
                } catch (err) {
                  setError(err instanceof Error ? err.message : '2FA setup failed.');
                }
              }}
            >
              Generate authenticator secret
            </button>
            <form onSubmit={event => { event.preventDefault(); enable(); }}>
              <label>
                Authenticator code
                <input inputMode="numeric" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
              </label>
              <button className="button" type="submit">Enable 2FA</button>
            </form>
          </>
        ) : (
          <>
            <div className="admin-login-icon"><ShieldCheck size={22} /></div>
            <h1>Verify your identity</h1>
            <p>Use your authenticator, email code, or recovery code.</p>
            <div className="admin-login-methods">
              <button type="button" onClick={() => setMethod('totp')}>Authenticator</button>
              <button type="button" onClick={() => { setMethod('email'); sendEmail(); }}>Email code</button>
              <button type="button" onClick={() => setMethod('recovery')}>Recovery</button>
            </div>
            <form onSubmit={submit}>
              <label>
                {method === 'recovery' ? 'Recovery code' : '6-digit verification code'}
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={e => setCode(method === 'recovery' ? e.target.value.toUpperCase().slice(0, 32) : e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={method === 'recovery' ? 32 : 6}
                  required
                />
              </label>
              <button className="button" type="submit">Verify & enter</button>
            </form>
            <button type="button" className="link-button" onClick={() => setStep('credentials')}>Back</button>
          </>
        )}

        {error && <div className="notice error">{error}</div>}
      </div>
    </div>
  );
}
