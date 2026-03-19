import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const backendError =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Giris basarisiz. Bilgilerini kontrol et.';
      setErrorMessage(String(backendError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--kf-border)] bg-white shadow-[0_24px_60px_-35px_rgba(15,31,56,0.4)] md:grid-cols-2">
        <aside className="hidden bg-gradient-to-br from-[#fff4e8] via-[#fefefe] to-[#eaf4ff] p-8 md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--kf-accent)]">kanbanfocus</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--kf-text)]">
            Tasarla, Gelistir,
            <br />
            Yayinla
          </h1>
          <p className="mt-4 text-sm text-[var(--kf-muted)]">
            PomoKanban ile odak surecini sade, hizli ve net yonet.
          </p>
          <div className="mt-6 space-y-2 text-sm text-[var(--kf-muted)]">
            <p>%100 mobil uyumlu board</p>
            <p>AI destekli gorev uretimi</p>
            <p>Surukle-birak kolon akisi</p>
          </div>
        </aside>

        <div className="w-full p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[var(--kf-text)]">Giris Yap</h2>
          <p className="mt-1 text-sm text-[var(--kf-muted)]">PomoKanban hesabina eris.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[var(--kf-text)]">
              E-posta veya kullanici adi
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--kf-border)] px-3 py-2 text-[var(--kf-text)] outline-none transition focus:border-[var(--kf-primary)]"
                required
              />
            </label>

            <label className="block text-sm font-medium text-[var(--kf-text)]">
              Sifre
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--kf-border)] px-3 py-2 text-[var(--kf-text)] outline-none transition focus:border-[var(--kf-primary)]"
                required
              />
            </label>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[var(--kf-primary)] px-4 py-2.5 font-semibold text-white transition hover:bg-[var(--kf-primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Giris yapiliyor...' : 'Giris Yap'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--kf-muted)]">
            Hesabin yok mu?{' '}
            <Link className="font-semibold text-[var(--kf-accent)] hover:opacity-85" to="/register">
              Kayit ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
