import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('artist@naive-sculptures.art');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Помилка входу. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-gallery-stone/40 gallery-card-border p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gallery-ink text-gallery-milk mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl text-gallery-ink font-medium">
            {t.admin.loginTitle}
          </h1>
          <p className="text-xs text-gallery-muted">
            {t.admin.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
              {t.admin.emailLabel}
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2.5 text-gallery-ink focus:outline-none focus:ring-1 focus:ring-gallery-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
              {t.admin.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2.5 text-gallery-ink focus:outline-none focus:ring-1 focus:ring-gallery-ink"
            />
            <span className="text-[10px] text-gallery-muted block mt-1">
              Підказка: використовуйте пароль Cognito або тестовий пароль для перегляду.
            </span>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              <span className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>{t.admin.loginBtn}</span>
              </span>
            </Button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-gallery-border/60">
          <Link
            to="/"
            className="inline-flex items-center text-xs text-gallery-muted hover:text-gallery-ink transition-colors space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Повернутися до галереї</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
