import React, { useState, type SubmitEventHandler } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { PATHS } from '../../routes/paths';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const from = (location.state as { from?: Location })?.from?.pathname;

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const user = await login(email, password, rememberMe);
            const destination = from ?? (user.role === 'admin' ? PATHS.admin.conversations : PATHS.app.chat);
            navigate(destination, { replace: true });
        } catch (err) {
            toast.error('Invalid email or password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-theme mb-1">Welcome back</h1>
            <p className="text-sm text-muted mb-6">Log in to continue your conversation.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm text-muted mb-1.5">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-theme-alt border border-theme text-theme text-sm outline-none focus:border-accent transition-colors"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm text-muted mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-theme-alt border border-theme text-theme text-sm outline-none focus:border-accent transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-theme accent-accent"
                    />
                    Remember me
                </label>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl accent-bg accent-fg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Logging in…' : 'Log in'}
                </button>
            </form>

            <p className="text-sm text-muted mt-6 text-center">
                Don't have an account?{' '}
                <Link to={PATHS.public.register} className="accent-text hover:underline">
                    Register
                </Link>
            </p>
        </div>
    );
};