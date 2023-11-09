import { useState, useEffect } from "@wordpress/element";
import { SearchControl } from "@wordpress/components";
import debounce from "lodash.debounce";
import { isValidUrl } from "../util";
import { SharedContext } from "../libs/contextProvider";
import { useContext } from "@wordpress/element";

const SiteSearch = ({ onClick, onChange, onKeyDown }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [showPopover, setShowPopover] = useState(false);
	const { sharedState, setSharedState } = useContext(SharedContext);

	// 非同期検索関数
	const performSearch = (query) => {
		fetch(`/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}`)
			.then((response) => response.json())
			.then((posts) => {
				setSearchResults(posts);
				setShowPopover(posts.length > 0);
			})
			.catch((error) => {
				console.error("エラーが発生しました:", error);
			});
	};

	// デバウンスされた検索関数
	const debouncedSearch = debounce((query) => {
		if (query.length > 1) {
			performSearch(query);
		} else {
			setSearchResults([]);
			setShowPopover(false);
		}
	}, 300);

	// 入力の変更を監視
	useEffect(() => {
		debouncedSearch(searchQuery);

		return () => {
			debouncedSearch.cancel();
		};
	}, [searchQuery]);

	// 画面クリック時にPopoverを閉じる関数
	const handleOutsideClick = (event) => {
		if (
			!event.target.closest(".search-results-popover") &&
			!event.target.closest(".search-component")
		) {
			setShowPopover(false);
		}
	};

	// useEffectを使ってクリックイベントリスナーを設定
	useEffect(() => {
		document.addEventListener("click", handleOutsideClick);
		return () => {
			document.removeEventListener("click", handleOutsideClick);
		};
	}, []);
	return (
		<div className="wp-blogcard-site-search">
			<SearchControl
				label="検索"
				value={searchQuery}
				onChange={(newSearchQuery) => {
					setSearchQuery(newSearchQuery);
					onChange(newSearchQuery);
				}}
				onKeyDown={onKeyDown}
				className="search-component"
				placeholder="URLを入力 / サイト内検索の場合はキーワードを入力"
			/>
			{showPopover && !isValidUrl(searchQuery) && (
				<div className="wp-blogcard-site-search-results">
					<ul className="">
						{searchResults.map((post) => (
							<li
								key={post.id}
								onClick={() => {
									onClick(post);
									setShowPopover(false);
								}}
								value={post}
							>
								{/* <a href={post.link} target="_blank" rel="noopener noreferrer">
								{post.title.rendered}
							</a> */}
								{post.title.rendered}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SiteSearch;
