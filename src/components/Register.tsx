import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
	const { currentUser, signup, loading } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// If already logged in, go to main
	useEffect(() => {
		if (!loading && currentUser) {
			navigate('/main', { replace: true });
		}
	}, [currentUser, loading, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// Validate passwords match
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		// Validate password length
		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		setIsSubmitting(true);

		try {
			await signup(email, password);
			// navigation happens automatically via the useEffect above
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ?
					err.message
				:	'Registration failed. Please try again.';
			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-lg text-gray-600">
					Checking login status...
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
				<h2 className="text-3xl font-bold mb-6 text-green-900 text-center">
					Perfect Scrabble Games
				</h2>
				<p className="text-center text-gray-600 mb-6">
					Create Your Account
				</p>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						/>
					</div>
					<div className="mb-4">
						<input
							type="password"
							placeholder="Password (at least 6 characters)"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						/>
					</div>
					<div className="mb-6">
						<input
							type="password"
							placeholder="Confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						/>
					</div>
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					>
						{isSubmitting ? 'Creating Account...' : 'Sign Up'}
					</button>
				</form>

				{error && (
					<p className="text-red-600 mt-4 text-center font-semibold">
						{error}
					</p>
				)}

				<div className="mt-6 text-center">
					<p className="text-gray-600">
						Already have an account?{' '}
						<Link
							to="/login"
							className="text-green-600 hover:text-green-700 font-semibold"
						>
							Login here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
