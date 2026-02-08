import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
	collection,
	getDocs,
	query,
	orderBy,
	limit,
	startAfter,
	DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Board from './Board';
import { BOARD_SIZE } from '../lib/gameSetup';
import { placeWord } from '../lib/utils';
import type { ScrabbleGameData } from '../lib/utils';

interface GameWithId extends ScrabbleGameData {
	id: string;
}

const CollectionViewer: React.FC = () => {
	const [games, setGames] = useState<GameWithId[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
	const [sortBy, setSortBy] = useState<'timestamp' | 'totalScore'>(
		'timestamp',
	);

	const PAGE_SIZE = 5;

	const fetchGames = async (loadMore = false) => {
		try {
			if (sortBy === 'totalScore') {
				// For total score sorting, fetch all games and sort client-side
				const q = query(collection(db, 'perfect-scrabble-games'));
				const querySnapshot = await getDocs(q);
				const gamesData: GameWithId[] = querySnapshot.docs.map(
					(doc) => {
						const data = doc.data();
						return {
							id: doc.id,
							turns: data.turns,
							timestamp: data.timestamp.toDate(),
						};
					},
				);
				// Sort by total score descending
				gamesData.sort((a, b) => {
					const scoreA = a.turns.reduce((sum, t) => sum + t.score, 0);
					const scoreB = b.turns.reduce((sum, t) => sum + t.score, 0);
					return scoreB - scoreA;
				});
				setGames(gamesData);
				setHasMore(false); // No pagination for total score sort
			} else {
				// For timestamp sorting, use pagination
				let q = query(
					collection(db, 'perfect-scrabble-games'),
					orderBy('timestamp', 'desc'),
					limit(PAGE_SIZE),
				);

				if (loadMore && lastDoc) {
					q = query(
						collection(db, 'perfect-scrabble-games'),
						orderBy('timestamp', 'desc'),
						startAfter(lastDoc),
						limit(PAGE_SIZE),
					);
				}

				const querySnapshot = await getDocs(q);
				const gamesData: GameWithId[] = querySnapshot.docs.map(
					(doc) => {
						const data = doc.data();
						return {
							id: doc.id,
							turns: data.turns,
							timestamp: data.timestamp.toDate(),
						};
					},
				);

				if (loadMore) {
					setGames((prev) => [...prev, ...gamesData]);
				} else {
					setGames(gamesData);
				}

				if (querySnapshot.docs.length < PAGE_SIZE) {
					setHasMore(false);
				} else {
					setLastDoc(
						querySnapshot.docs[querySnapshot.docs.length - 1],
					);
				}
			}
		} catch (err) {
			console.error('Error fetching games:', err);
			setError('Failed to load games.');
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		setLoading(true);
		setHasMore(true);
		setLastDoc(null);
		fetchGames();
	}, [sortBy]);

	const loadMoreGames = () => {
		setLoadingMore(true);
		fetchGames(true);
	};

	const exportAsJSON = async () => {
		try {
			// Fetch all games for export
			const q = query(collection(db, 'perfect-scrabble-games'));
			const querySnapshot = await getDocs(q);
			const allGamesData = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				turns: doc.data().turns,
				timestamp: doc.data().timestamp.toDate(),
			}));

			// Create JSON blob
			const jsonString = JSON.stringify(allGamesData, null, 2);
			const blob = new Blob([jsonString], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			// Create download link and trigger download
			const link = document.createElement('a');
			link.href = url;
			link.download = `perfect-scrabble-games-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Error exporting games:', err);
			alert('Failed to export games. Please try again.');
		}
	};

	const calculatePlayerScores = (turns: ScrabbleGameData['turns']) => {
		const playerA = turns
			.filter((t) => t.id % 2 === 1)
			.reduce((sum, t) => sum + t.score, 0);
		const playerB = turns
			.filter((t) => t.id % 2 === 0)
			.reduce((sum, t) => sum + t.score, 0);
		const total = playerA + playerB;
		return { playerA, playerB, total };
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-4 px-4 flex items-center justify-center">
				<p>Loading games...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 py-4 px-4 flex items-center justify-center">
				<p className="text-red-600">{error}</p>
				<Link
					to="/"
					className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
				>
					Back
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-4 px-4">
			<div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-2xl">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold text-green-900">
						Perfect Scrabble Games Collection
					</h1>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<label
								htmlFor="sort-select"
								className="text-sm font-medium text-gray-700"
							>
								Sort by:
							</label>
							<select
								id="sort-select"
								value={sortBy}
								onChange={(e) =>
									setSortBy(
										e.target.value as
											| 'timestamp'
											| 'totalScore',
									)
								}
								className="px-1 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								<option value="timestamp">Date</option>
								<option value="totalScore">Total Score</option>
							</select>
						</div>
						<button
							onClick={exportAsJSON}
							className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded shadow-lg"
						>
							Export as JSON
						</button>
						<Link
							to="/"
							className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded shadow-lg"
						>
							Back to Game
						</Link>
					</div>
				</div>
				{games.length === 0 ?
					<p>No games found.</p>
				:	<div className="space-y-4">
						{games.map((game) => {
							const scores = calculatePlayerScores(game.turns);
							const finalBoard = game.turns.reduce(
								(board, turn) =>
									placeWord(board, {
										row: turn.row,
										col: turn.col,
										direction: turn.direction,
										bingo: turn.bingo,
										blanks: turn.blanks,
									}),
								Array(BOARD_SIZE)
									.fill(null)
									.map(() => Array(BOARD_SIZE).fill('')),
							);
							return (
								<div
									key={game.id}
									className="border border-gray-300 rounded-lg p-4"
								>
									<div className="flex justify-between items-center mb-2">
										<h2 className="text-lg font-semibold">
											Game ID: {game.id}
										</h2>
										<p className="text-sm text-gray-600">
											{game.timestamp.toLocaleString()}
										</p>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div>
											<h3 className="font-bold text-green-900">
												Player A
											</h3>
											<p>Score: {scores.playerA}</p>
										</div>
										<div>
											<h3 className="font-bold text-green-900">
												Player B
											</h3>
											<p>Score: {scores.playerB}</p>
										</div>
										<div>
											<h3 className="font-bold text-green-900">
												Total
											</h3>
											<p>Score: {scores.total}</p>
										</div>
									</div>
									<details className="mt-4">
										<summary className="cursor-pointer text-blue-600">
											View Board
										</summary>
										<div className="mt-2 flex justify-center">
											<div className="transform scale-100">
												<Board
													board={finalBoard}
													onTileClick={() => {}}
													selectedRow={null}
													selectedCol={null}
													interactive={false}
												/>
											</div>
										</div>
									</details>
									<details className="mt-4">
										<summary className="cursor-pointer text-blue-600">
											View Turns
										</summary>
										<div className="mt-2">
											<table className="table-auto w-full border-collapse border border-gray-300">
												<thead>
													<tr className="bg-gray-100">
														<th className="border border-gray-300 px-4 py-2">
															ID
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Bingo
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Direction
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Row
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Column
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Overlap
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Score
														</th>
														<th className="border border-gray-300 px-4 py-2">
															Blanks
														</th>
													</tr>
												</thead>
												<tbody>
													{game.turns.map((turn) => (
														<tr
															key={turn.id}
															className="text-center"
														>
															<td className="border border-gray-300 px-4 py-2">
																{turn.id}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{turn.bingo}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{turn.direction}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{turn.row + 1}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{String.fromCharCode(
																	65 +
																		turn.col,
																)}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{turn.overlap ?
																	`${turn.overlap.tile} (${turn.overlap.index})`
																:	'None'}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{turn.score}
															</td>
															<td className="border border-gray-300 px-4 py-2">
																{turn.blanks ?
																	`${turn.blanks.tile} (${turn.blanks.indices.join(', ')})`
																:	'-'}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</details>
								</div>
							);
						})}
						{sortBy === 'timestamp' && hasMore && (
							<div className="text-center mt-6">
								<button
									onClick={loadMoreGames}
									disabled={loadingMore}
									className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded shadow-lg"
								>
									{loadingMore ?
										'Loading...'
									:	'Load More Games'}
								</button>
							</div>
						)}
					</div>
				}
			</div>
		</div>
	);
};

export default CollectionViewer;
