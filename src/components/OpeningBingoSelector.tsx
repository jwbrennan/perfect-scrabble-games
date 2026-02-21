// Prompts user to click a starting square and select direction for opening bingo
import { useState, useEffect } from 'react';
import { CENTER, LETTER_POINTS } from '../lib/gameSetup';
import { placeWord } from '../lib/utils';

interface Props {
	sevenLetterWords: string[];
	onPlace: (
		newBoard: string[][],
		bingo: string,
		row: number,
		col: number,
		direction: 'H' | 'V',
	) => void;

	onStartSquareSelected: (
		handler: (row: number, col: number) => void,
	) => (() => void) | undefined;
	onSquareSelected: (row: number | null, col: number | null) => void;
}
export default function OpeningBingoSelector({
	sevenLetterWords,
	onPlace,
	onStartSquareSelected,
	onSquareSelected,
}: Props) {
	const [openingBingo, setOpeningBingo] = useState<string>(() => {
		return sevenLetterWords[
			Math.floor(Math.random() * sevenLetterWords.length)
		];
	});
	const [startRow, setStartRow] = useState<number | null>(null);
	const [startCol, setStartCol] = useState<number | null>(null);

	useEffect(() => {
		if (!openingBingo) return;

		const handler = (row: number, col: number) => {
			setStartRow(row);
			setStartCol(col);
			onSquareSelected(row, col);
		};
		const cleanup = onStartSquareSelected(handler);

		return () => {
			cleanup?.();
		};
	}, [openingBingo, onStartSquareSelected, onSquareSelected]);

	const tryPlace = (direction: string) => {
		if (startRow === null || startCol === null) return;

		const endRow = direction === 'H' ? startRow : startRow + 6;
		const endCol = direction === 'H' ? startCol + 6 : startCol;

		if (endRow > 14 || endCol > 14) {
			alert("Word doesn't fit — goes off the board!");
			return;
		}

		const coversCenter =
			direction === 'H' ?
				startRow === CENTER &&
				startCol <= CENTER &&
				startCol + 6 >= CENTER
			:	startCol === CENTER &&
				startRow <= CENTER &&
				startRow + 6 >= CENTER;

		if (!coversCenter) {
			alert('First move must cover the centre star!');
			return;
		}

		const emptyBoard = Array(15)
			.fill(null)
			.map(() => Array(15).fill(''));
		const newBoard = placeWord(emptyBoard, {
			bingo: openingBingo,
			row: startRow,
			col: startCol,
			direction: direction as 'H' | 'V',
			blanks: null,
		});

		onPlace(
			newBoard,
			openingBingo,
			startRow,
			startCol,
			direction as 'H' | 'V',
		);
	};
	return (
		<div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mt-4 mb-4 w-full md:w-[32rem] mx-auto space-y-4">
			<div className="flex justify-center gap-3">
				{openingBingo.split('').map((l, i) => (
					<div
						key={i}
						className="relative w-8 h-8 md:w-12 md:h-12 bg-amber-100 border-2 border-amber-600 rounded-lg shadow-xl flex items-center justify-center"
					>
						<span className="text-base md:text-lg font-semibold md:font-bold">
							{l}
						</span>
						<span className="absolute bottom-0.5 md:bottom-1 right-0.5 md:right-1 text-[10px] md:text-xs font-normal md:font-bold">
							{LETTER_POINTS[l] || 0}
						</span>
					</div>
				))}
			</div>

			<div className="text-lg text-center">
				{startRow === null ?
					<p>
						Click any square on the board to place the first letter
					</p>
				:	<p className="text-green-600 font-bold">
						Starting square selected! Choose direction:
					</p>
				}
			</div>

			<div className="flex justify-center gap-4">
				<button
					onClick={() => tryPlace('H')}
					disabled={startRow === null}
					className="px-2 py-2 md:px-3 md:py-3 bg-black text-white text-sm md:text-lg font-bold rounded-lg
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition hover:scale-105"
				>
					Horizontal
				</button>

				<button
					onClick={() => tryPlace('V')}
					disabled={startRow === null}
					className="px-2 py-2 md:px-3 md:py-3 bg-black text-white text-sm md:text-lg font-bold rounded-lg
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition hover:scale-105"
				>
					Vertical
				</button>

				<button
					onClick={() =>
						// reset the selected start square when choosing a new word
						// so the UI requires the user to click again
						(() => {
							setOpeningBingo(
								sevenLetterWords[
									Math.floor(
										Math.random() * sevenLetterWords.length,
									)
								],
							);
							setStartRow(null);
							setStartCol(null);
							onSquareSelected(null, null);
						})()
					}
					className="px-4 py-2 md:px-6 md:py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm md:text-lg rounded-full"
				>
					New Bingo
				</button>
			</div>
		</div>
	);
}
