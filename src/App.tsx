import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import MainPage from './components/MainPage';
import CollectionViewer from './components/CollectionViewer';
import Login from './components/Login';
import Register from './components/Register';

// Simple protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { currentUser, loading } = useAuth();

	if (loading) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				Loading...
			</div>
		);
	}

	if (!currentUser) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route
						path="/"
						element={<Navigate to="/login" replace />}
					/>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route
						path="/main"
						element={
							<ProtectedRoute>
								<MainPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/collection"
						element={
							<ProtectedRoute>
								<CollectionViewer />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
