import { SharedContextProvider } from "./libs/contextProvider";
import Blogcard from "./components/Blogcard";

export default function edit(props) {
	return (
		<SharedContextProvider>
			<Blogcard props={props} />
		</SharedContextProvider>
	);
}
