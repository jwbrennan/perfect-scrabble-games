import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
	});
}

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	// Extract and verify the Firebase ID token from the request header
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res
			.status(401)
			.json({ error: 'Unauthorized: Missing or invalid token' });
	}
	const idToken = authHeader.split('Bearer ')[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		const userId = decodedToken.uid; // Use this for user-specific logic

		// Add custom validation here (e.g., check if the move is valid for Scrabble)
		// Example: Ensure required fields are present
		const { collection, data } = req.body;
		if (!collection || !data) {
			return res
				.status(400)
				.json({ error: 'Invalid request: Missing collection or data' });
		}

		// Perform the write (customize as needed)
		const db = admin.firestore();
		const docRef = await db.collection(collection).add({
			userId,
			...data,
			timestamp: admin.firestore.FieldValue.serverTimestamp(),
		});

		res.status(200).json({ success: true, docId: docRef.id });
	} catch (error) {
		console.error('Error in server-side write:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}
