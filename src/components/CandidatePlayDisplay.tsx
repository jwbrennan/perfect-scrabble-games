import { useEffect } from 'react';
import { styleWithBlanks } from '../lib/styleWithBlanks';
import { LETTER_POINTS } from '../lib/gameSetup';
import type { CandidatePlay } from '../lib/candidatePlays';

interface Props {
	candidates: CandidatePlay[];
	currentCandidateIndex: number;
	setBoard: (b: string[][]) => void;
	originalBoard: string[][] | null;
	onAccept: (candidate: CandidatePlay) => void;
	onSkip: () => void;
	onPrevious: () => void;
	onNext: () => void;
}

export default function CandidatePlayDisplay({
	candidates,
	currentCandidateIndex,
	setBoard,
	originalBoard,
	onAccept,
	onSkip,
	onPrevious,
	onNext,
}: Props) {
	// Preview current candidate on board
	useEffect(() => {
		if (!originalBoard || candidates.length === 0) return;

		const candidate = candidates[currentCandidateIndex];
		const styledResult = styleWithBlanks(
			originalBoard,
			candidate.bingo,
			candidate.row,
			candidate.col,
			candidate.direction,
			candidate.blanks,
		);

		if (styledResult) {
			setBoard(styledResult.board);
		}
	}, [currentCandidateIndex, candidates, originalBoard, setBoard]);

	if (candidates.length === 0) return null;

	const currentCandidate = candidates[currentCandidateIndex];

	return (
		<div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mt-4 mb-4 w-full md:max-w-4xl mx-auto space-y-4">
			<div className="text-center space-y-3">
				<div className="flex justify-center gap-2 flex-wrap">
					{currentCandidate.bingo.split('').map((l, i) => (
						<div
							key={i}
							className="relative w-7 h-7 md:w-12 md:h-12 bg-amber-100 border-2 border-amber-600 rounded-sm shadow-xl flex items-center justify-center"
						>
							<span className="text-sm md:text-lg font-semibold md:font-bold">
								{l}
							</span>
							<span className="absolute bottom-0 md:bottom-1 right-0 md:right-1 text-[8px] md:text-xs font-normal md:font-bold">
								{LETTER_POINTS[l] || 0}
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-3">
				{/* Navigation buttons */}
				<div className="flex justify-center gap-3 items-center">
					<button
						onClick={onPrevious}
						disabled={currentCandidateIndex === 0}
						className="px-3 py-2 md:px-4 md:py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
					>
						Previous
					</button>
					<span className="text-sm text-gray-600">
						{currentCandidateIndex + 1} / {candidates.length}
					</span>
					<button
						onClick={onNext}
						disabled={
							currentCandidateIndex === candidates.length - 1
						}
						className="px-3 py-2 md:px-4 md:py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
					>
						Next
					</button>
				</div>

				{/* Action buttons */}
				<div className="flex justify-center gap-3">
					<button
						onClick={onSkip}
						className="px-3 py-2 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm md:text-base"
					>
						Skip This Word
					</button>
					<button
						onClick={() => onAccept(currentCandidate)}
						className="px-4 py-2 md:px-6 md:py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm md:text-base"
					>
						Accept This Play
					</button>
				</div>
			</div>
		</div>
	);
}
