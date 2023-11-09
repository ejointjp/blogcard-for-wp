import { createContext, useState } from "@wordpress/element";

export const SharedContext = createContext();

export function SharedContextProvider({ children }) {
	const [sharedState, setSharedState] = useState("");

	return (
		<SharedContext.Provider value={{ sharedState, setSharedState }}>
			{children}
		</SharedContext.Provider>
	);
}
