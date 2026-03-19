import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Sifreler ayni degil.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate('/', { replace: true });
    } catch (error) {
      const backendError =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Kayit basarisiz. Bilgilerini kontrol et.';
      setErrorMessage(String(backendError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--kf-border)] bg-white shadow-[0_24px_60px_-35px_rgba(15,31,56,0.4)] md:grid-cols-2">
        <aside className="hidden bg-gradient-to-br from-[#eaf4ff] via-[#fefefe] to-[#fff3e4] p-8 md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--kf-accent)]">kanbanfocus</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--kf-text)]">
            Odakli ekipler icin
            <br />
            hizli baslangic
          </h1>
          <p className="mt-4 text-sm text-[var(--kf-muted)]">
            Hesabini ac, kolonlarini kur ve hedeflerini AI ile gorevlere cevir.
          </p>
          <div className="mt-6 space-y-2 text-sm text-[var(--kf-muted)]">
            <p>Kolon tabanli sprint planlama</p>
            <p>Pomodoro takibi ve ilerleme</p>
            <p>Takim odakli sade gorunum</p>
          </div>
        </aside>

        <div className="w-full p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[var(--kf-text)]">Kayit Ol</h2>
          <p className="mt-1 text-sm text-[var(--kf-muted)]">Yeni bir PomoKanban hesabi olustur.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[var(--kf-text)]">
              Kullanici adi
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--kf-border)] px-3 py-2 text-[var(--kf-text)] outline-none transition focus:border-[var(--kf-primary)]"
                required
              />
            </label>

            <label className="block text-sm font-medium text-[var(--kf-text)]">
              E-posta
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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

            <label className="block text-sm font-medium text-[var(--kf-text)]">
              Sifre tekrar
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
              {isSubmitting ? 'Kayit olusturuluyor...' : 'Kayit Ol'}
            </button>
          </form>

          <p className="mt-5 text-sm text-[var(--kf-muted)]">
            Zaten hesabin var mi?{' '}
            <Link className="font-semibold text-[var(--kf-accent)] hover:opacity-85" to="/login">
              Giris yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
