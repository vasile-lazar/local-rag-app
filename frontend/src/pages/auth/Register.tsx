import React, { useState, type SubmitEventHandler } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { PATHS } from '../../routes/paths';

export const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(username, email, password, confirmPassword);
            navigate(PATHS.app.chat, { replace: true });
        } catch (err) {
            toast.error('Registration failed. That email may already be taken.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-theme mb-1">Create an account</h1>
            <p className="text-sm text-muted mb-6">Start asking questions about the Constitution.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="username" className="block text-sm text-muted mb-1.5">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        minLength={3}
                        maxLength={50}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-theme-alt border border-theme text-theme text-sm outline-none focus:border-accent transition-colors"
                        placeholder="your_username"
                    />
                </div>

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
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-theme-alt border border-theme text-theme text-sm outline-none focus:border-accent transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm text-muted mb-1.5">
                        Confirm password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-theme-alt border border-theme text-theme text-sm outline-none focus:border-accent transition-colors"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl accent-bg accent-fg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creating account…' : 'Create account'}
                </button>
            </form>

            <p className="text-sm text-muted mt-6 text-center">
                Already have an account?{' '}
                <Link to={PATHS.public.login} className="accent-text hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
};