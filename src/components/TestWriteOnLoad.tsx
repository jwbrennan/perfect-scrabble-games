import { useEffect, useState } from 'react';
export default function TestWriteOnLoad() {
	const [status, setStatus] = useState<
		'idle' | 'sending' | 'success' | 'error'
	>('idle');
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const run = async () => {
			const localData = localStorage.getItem('perfectScrabbleGame');
			if (!localData) {
				setMessage('no localStorage item: perfectScrabbleGame');
				return;
			}
			setStatus('sending');
			try {
				const response = await fetch(
					'https://www.wolframcloud.com/obj/josephb/Scrabble/LiveAPIs/WriteToFirestore',
					{
						method: 'POST',
						body: new URLSearchParams({
							data: localData,
						}),
					},
				);
				console.log(response);
				if (!response.ok) {
					throw new Error(
						`API request failed with status ${response.status}`,
					);
				}

				const json = await response.json();
				setMessage(`saved docId=${json.docId}`);
				setStatus('success');
			} catch (err: unknown) {
				setMessage(err instanceof Error ? err.message : String(err));
				setStatus('error');
			}
		};

		run();
	}, []);

	return (
		<div className="p-2 text-sm">
			<div>TestWriteOnLoad: {status}</div>
			{message && <div className="text-xs">{message}</div>}
		</div>
	);
}
