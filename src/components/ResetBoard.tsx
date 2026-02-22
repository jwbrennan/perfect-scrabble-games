// A button component to clear the Scrabble board
interface Props {
	onClear: () => void;
}

export default function ResetBoard({ onClear }: Props) {
	return (
		<button
			onClick={onClear}
			className="px-2 py-2 text-lg md:px-4 md:py-4 md:text-2xl bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-full shadow-2xl transition"
		>
			Reset Board
		</button>
	);
}
