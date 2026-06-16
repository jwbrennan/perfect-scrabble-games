// src/contexts/AuthContext.tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	createUserWithEmailAndPassword,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const login = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password);
	};

	const logout = async () => {
		await signOut(auth);
	};

	const signup = async (email: string, password: string) => {
		await createUserWithEmailAndPassword(auth, email, password);
	};

	const value = {
		currentUser,
		loading,
		login,
		logout,
		signup,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
