import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
	const { currentUser, signup, loading } = useAuth();
	const navigate = useNavigate();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [registrationComplete, setRegistrationComplete] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// If already logged in, go to main (but not after fresh registration)
	useEffect(() => {
		if (!loading && currentUser && !isSubmitting) {
			navigate('/main', { replace: true });
		}
	}, [currentUser, loading, navigate, isSubmitting]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// Validate username
		if (username.length < 3) {
			setError('Username must be at least 3 characters');
			return;
		}

		if (username.length > 20) {
			setError('Username must be 20 characters or less');
			return;
		}

		if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			setError(
				'Username can only contain letters, numbers, and underscores',
			);
			return;
		}

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
			await signup(email, password, username);
			setRegisteredEmail(email);
			setRegistrationComplete(true);
			setIsSubmitting(false);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ?
					err.message
				:	'Registration failed. Please try again.';
			setError(errorMessage);
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

	// Show success page after registration
	if (registrationComplete) {
		return (
			<div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
				<div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
					<div className="text-center">
						<div className="mb-6">
							<svg
								className="mx-auto h-16 w-16 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-3xl font-bold mb-4 text-green-900">
							Account Created Successfully!
						</h2>
						<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<p className="text-blue-900 font-semibold mb-2">
								📧 Verification Email Sent
							</p>
							<p className="text-blue-800 text-sm">
								We've sent a verification email to:
							</p>
							<p className="text-blue-900 font-semibold mt-1">
								{registeredEmail}
							</p>
						</div>
						<div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
							<p className="text-gray-700 text-sm mb-2">
								<strong>Next steps:</strong>
							</p>
							<ol className="text-gray-600 text-sm space-y-1 list-decimal list-inside">
								<li>Check your email inbox</li>
								<li>Click the verification link</li>
								<li>Return here to log in</li>
							</ol>
							<p className="text-gray-500 text-xs mt-3">
								💡 Don't see the email? Check your spam/junk
								folder.
							</p>
						</div>
						<Link
							to="/login"
							className="block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition text-center"
						>
							Go to Login
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Show registration form
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
							type="text"
							placeholder="Username (3-20 characters)"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						/>
					</div>
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
					<div className="mb-4 relative">
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder="Password (at least 6 characters)"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
							aria-label="Toggle password visibility"
						>
							{showPassword ?
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
									/>
								</svg>
							:	<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
							}
						</button>
					</div>
					<div className="mb-6 relative">
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="Confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
						/>
						<button
							type="button"
							onClick={() =>
								setShowConfirmPassword(!showConfirmPassword)
							}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
							aria-label="Toggle confirm password visibility"
						>
							{showConfirmPassword ?
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
									/>
								</svg>
							:	<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
							}
						</button>
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
