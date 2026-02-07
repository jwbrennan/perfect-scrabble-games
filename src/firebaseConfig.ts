// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyAE33P92IEoZU38JzRzp5krK3bzazq8R-g',
	authDomain: 'perfect-scrabble-games.firebaseapp.com',
	projectId: 'perfect-scrabble-games',
	storageBucket: 'perfect-scrabble-games.firebasestorage.app',
	messagingSenderId: '993938539832',
	appId: '1:993938539832:web:3c0a96929280948a36edcd',
	measurementId: 'G-T63042C8X8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable anonymous authentication
signInAnonymously(auth).catch((error) => {
	console.error('Failed to authenticate anonymously:', error);
});

export { db, analytics, auth };
