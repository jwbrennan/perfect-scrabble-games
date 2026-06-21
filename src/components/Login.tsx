import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
	const { currentUser, login, loading } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showVerificationError, setShowVerificationError] = useState(false);
	const errorPersistRef = useRef<string>('');

	// If already logged in AND email is verified, go to main
	useEffect(() => {
		if (!loading && currentUser && currentUser.emailVerified) {
			navigate('/main', { replace: true });
		}
		// Don't clear error on currentUser changes
	}, [currentUser, loading, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setShowVerificationError(false);
		errorPersistRef.current = '';
		setIsSubmitting(true);

		try {
			// Attempt login - Firebase Auth is the source of truth for verification status
			await login(email, password);
		} catch (err: unknown) {
			let errorMessage =
				err instanceof Error ?
					err.message
				:	'Login failed. Please check your credentials.';

			// Transform Firebase error messages to user-friendly ones
			if (errorMessage.includes('auth/invalid-credential')) {
				errorMessage = 'Invalid Credentials!';
			}

			// Persist error in ref to prevent clearing on re-renders
			errorPersistRef.current = errorMessage;

			// Check if it's an email verification error
			if (errorMessage.includes('verify your email')) {
				setShowVerificationError(true);
			}

			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Restore error from ref if it exists (in case of re-render)
	useEffect(() => {
		if (errorPersistRef.current && !error) {
			setError(errorPersistRef.current);
			if (errorPersistRef.current.includes('verify your email')) {
				setShowVerificationError(true);
			}
		}
	}, [error]);

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
			<div className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full items-start justify-center">
				{/* Login Form */}
				<div className="bg-white p-8 rounded-lg shadow-xl w-full lg:w-96 flex-shrink-0">
					<h2 className="text-3xl font-bold mb-6 text-green-900 text-center">
						Perfect Scrabble Games
					</h2>
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
						<div className="mb-6">
							<input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
							/>
						</div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
						>
							{isSubmitting ? 'Logging in...' : 'Login'}
						</button>
					</form>

					{error && (
						<div className="mt-4">
							<p className="text-red-600 text-center font-semibold">
								{error}
							</p>
							{showVerificationError && (
								<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
									<p className="text-sm text-yellow-800 text-center">
										Please check your email inbox (and spam
										folder) for the verification link we
										sent when you registered.
									</p>
								</div>
							)}
						</div>
					)}

					<div className="mt-6 text-center">
						<p className="text-gray-600">
							Don't have an account?{' '}
							<Link
								to="/register"
								className="text-green-600 hover:text-green-700 font-semibold"
							>
								Sign up here
							</Link>
						</p>
					</div>
				</div>

				{/* Welcome Message */}
				<div className="bg-white p-8 rounded-lg shadow-xl w-full lg:w-auto lg:max-w-xl">
					<h3 className="text-2xl font-bold mb-4 text-green-900">
						Welcome!
					</h3>
					<div className="text-gray-700 space-y-3">
						<p>
							A Perfect Scrabble Game is one in which every turn
							uses all seven of the tiles on your rack (a bingo).
						</p>
						<p>
							Assuming perfect word knowledge and very lucky
							tiles, two players can, in principle, have seven
							bingos each!
						</p>
						<p>
							A combined fourteen bingos leaves (100 tiles - 14 ×
							7 tiles per bingo) 2 tiles left in the bag at the
							end of the game.
						</p>
						<p>
							The objective of this web app is to build your own
							'Perfect Scrabble Game'.
						</p>
						<p className="mt-4 font-semibold text-green-900">
							Have Fun!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
