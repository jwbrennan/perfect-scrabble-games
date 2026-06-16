import { Link } from 'react-router-dom';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
				<h2 className="text-3xl font-bold mb-6 text-green-900 text-center">
					Perfect Scrabble Games
				</h2>
				<div className="text-center">
					<h1 className="text-6xl font-bold text-green-900 mb-4">
						404
					</h1>
					<p className="text-xl text-gray-600 mb-6">Page Not Found</p>
					<p className="text-gray-500 mb-8">
						The page you're looking for doesn't exist or has been
						moved.
					</p>
					<Link
						to="/login"
						className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition"
					>
						Go to Login
					</Link>
				</div>
			</div>
		</div>
	);
}
