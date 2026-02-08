import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import type { Turn, FirestoreTurn, ScrabbleGameData } from '../lib/utils';

interface GameCompleteProps {
	turns: Turn[];
}

const GameComplete: React.FC<GameCompleteProps> = ({ turns }) => {
	const [saveStatus, setSaveStatus] = useState<
		'idle' | 'saving' | 'saved' | 'error'
	>('idle');
	const [savedGameId, setSavedGameId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Only attempt to save if the component mounts and hasn't tried saving yet
		if (saveStatus === 'idle' && turns.length === 14) {
			// Ensure it's a complete game for saving
			const saveGameToFirestore = async () => {
				setSaveStatus('saving');
				try {
					const auth = getAuth();
					const user = auth.currentUser;
					if (!user) {
						throw new Error('User not authenticated');
					}
					const idToken = await user.getIdToken();

					const turnsForFirestore: FirestoreTurn[] = turns.map(
						(turn) => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { tileBag, tilesLeft, ...rest } = turn;
							return rest;
						},
					);
					const completedGame: ScrabbleGameData = {
						turns: turnsForFirestore,
						timestamp: new Date(),
					};

					const response = await fetch('/api/write', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${idToken}`
						},
						body: JSON.stringify({
							collection: 'perfect-scrabble-games',
							data: completedGame
						})
					});

					if (!response.ok) {
						throw new Error(`Failed to save: ${response.statusText}`);
					}

					const result = await response.json();
					setSavedGameId(result.docId);
					setSaveStatus('saved');
				} catch (e: unknown) {
					// Changed 'any' to 'unknown'
					console.error('Error adding game document: ', e);
					// Type narrowing for the error object
					if (e instanceof Error) {
						setError(e.message);
					} else {
						setError(
							'An unknown error occurred while saving the game.',
						);
					}
					setSaveStatus('error');
				}
			};

			saveGameToFirestore();
		}
	}, [turns, saveStatus]); // Dependencies: re-run if turns array changes or saveStatus changes

	return (
		<div>
			<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center py-6">
				<p className="text-xl text-gray-700 mb-4 text-center max-w-xs">
					🎉 Game Complete! 🎉
				</p>
				<p className="text-base text-gray-800">
					You've successfully played 14 perfect Scrabble turns!
				</p>
				{saveStatus === 'saving' && <p>Saving game to database...</p>}
				{saveStatus === 'saved' && (
					<p className="text-base text-gray-800">
						Game ID: <strong>{savedGameId}</strong>
					</p>
				)}
				{saveStatus === 'error' && (
					<p style={{ color: 'red' }}>Error saving game: {error}</p>
				)}
			</div>
		</div>
	);
};

export default GameComplete;
