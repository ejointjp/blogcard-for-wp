import { createContext, useState } from '@wordpress/element';

export const SharedContext = createContext();

export function SharedContextProvider({ children, defaultUrl }) {
	const [state, setState] = useState('hidden'); // 状態ごとに表示を変えるため
	const [tempUrl, setTempUrl] = useState(''); // URL入力時にapi叩きまくらないようにするため Enterを押すとurlにコピーされる
	const [searchQuery, setSearchQuery] = useState(defaultUrl);
	const [postId, setPostId] = useState(); // サイト内検索から選択した場合、POST IDを保存

	return (
		<SharedContext.Provider
			value={{
				postId,
				setPostId,
				searchQuery,
				setSearchQuery,
				state,
				setState,
				tempUrl,
				setTempUrl,
			}}
		>
			{children}
		</SharedContext.Provider>
	);
}
