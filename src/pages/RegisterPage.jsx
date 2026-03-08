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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Kayit Ol</h1>
        <p className="mt-1 text-sm text-gray-500">Yeni bir PomoKanban hesabi olustur.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">
            Kullanici adi
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-red-300 transition focus:border-red-400 focus:ring"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            E-posta
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-red-300 transition focus:border-red-400 focus:ring"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Sifre
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-red-300 transition focus:border-red-400 focus:ring"
              required
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Sifre tekrar
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-red-300 transition focus:border-red-400 focus:ring"
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
            className="w-full rounded-lg bg-red-500 px-4 py-2.5 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isSubmitting ? 'Kayit olusturuluyor...' : 'Kayit Ol'}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-600">
          Zaten hesabin var mi?{' '}
          <Link className="font-semibold text-red-600 hover:text-red-700" to="/login">
            Giris yap
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
