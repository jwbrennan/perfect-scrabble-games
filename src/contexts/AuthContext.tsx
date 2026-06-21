// src/contexts/AuthContext.tsx
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	createUserWithEmailAndPassword,
	updateProfile,
	sendEmailVerification,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
	collection,
	doc,
	setDoc,
	query,
	where,
	getDocs,
	limit,
	updateDoc,
	getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);

			// Update Firestore emailVerified field only for verified users
			// This prevents permission errors when unverified users briefly authenticate
			if (user && user.emailVerified) {
				try {
					const userDocRef = doc(db, 'users', user.uid);
					const userDoc = await getDoc(userDocRef);

					// Only update if the emailVerified status has changed in Firestore
					if (
						userDoc.exists() &&
						userDoc.data().emailVerified !== true
					) {
						await updateDoc(userDocRef, {
							emailVerified: true,
						});
					}
				} catch (error) {
					console.error(
						'Error updating emailVerified in Firestore:',
						error,
					);
				}
			}

			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const login = async (email: string, password: string) => {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password,
		);
		const user = userCredential.user;

		// Check if email is verified
		if (!user.emailVerified) {
			// Sign out immediately to prevent access
			await signOut(auth);
			throw new Error(
				'Please verify your email before logging in. Check your inbox for the verification link.',
			);
		}
	};

	const logout = async () => {
		await signOut(auth);
	};

	const signup = async (
		email: string,
		password: string,
		username: string,
	) => {
		// Check if username is already taken
		const usersRef = collection(db, 'users');
		const usernameQuery = query(
			usersRef,
			where('username', '==', username),
			limit(1),
		);

		const querySnapshot = await getDocs(usernameQuery);

		if (!querySnapshot.empty) {
			throw new Error('Username is already taken');
		}

		// Create user account
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);
		const user = userCredential.user;

		// Update display name
		await updateProfile(user, {
			displayName: username,
		});

		// Store user data in Firestore
		try {
			await setDoc(doc(db, 'users', user.uid), {
				username: username,
				email: email,
				createdAt: new Date().toISOString(),
				emailVerified: false,
			});
		} catch (error) {
			console.error('Firestore setDoc error:', error);
			throw new Error('Failed to create user profile in database');
		}

		// Send email verification (must be done before signing out)
		try {
			await sendEmailVerification(user);
		} catch (error) {
			console.error('Email verification error:', error);
		}

		// Sign out the user so they need to explicitly log in
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Sign out error:', error);
		}
	};

	const resendVerificationEmail = async () => {
		if (currentUser && !currentUser.emailVerified) {
			await sendEmailVerification(currentUser);
		} else {
			throw new Error('No user logged in or email already verified');
		}
	};

	const value = {
		currentUser,
		loading,
		login,
		logout,
		signup,
		resendVerificationEmail,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
