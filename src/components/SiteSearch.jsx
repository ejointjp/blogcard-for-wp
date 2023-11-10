import { useState, useEffect } from '@wordpress/element';
import { SearchControl } from '@wordpress/components';
import debounce from 'lodash.debounce';
import { isValidUrl } from '../util';
import { SharedContext } from '../libs/contextProvider';
import { useContext } from '@wordpress/element';

const SiteSearch = ({ attributes, setAttributes }) => {
	const { url } = attributes;
	const [searchResults, setSearchResults] = useState([]);
	const [showPopover, setShowPopover] = useState(false);
	const { setPostId, searchQuery, setSearchQuery, setState } = useContext(SharedContext);

	// 非同期検索関数
	const performSearch = (query) => {
		fetch(`/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}`)
			.then((response) => response.json())
			.then((posts) => {
				setSearchResults(posts);
				setShowPopover(posts.length > 0);
			})
			.catch((error) => {
				console.error('エラーが発生しました:', error);
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

	// 画面クリック時にPopoverを閉じる
	const handleOutsideClick = () => {
		setShowPopover(false);
	};

	// Enterを押したら
	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();

			// 前のURLと同じなら何もしない
			if (searchQuery === url) {
				return;
			}

			// 検索バーが空なら何もしない
			if (searchQuery === '') {
				setState('url-empty');
				return false;
			}

			// URLの形式ならURLを登録する（検索がはじまる）
			if (isValidUrl(searchQuery)) {
				setAttributes({ url: searchQuery });
				// 検索モード
				setState('search');
			}
		}
	};

	// サイト内検索の結果をクリックしたら
	const handleClickResult = (value) => {
		setAttributes({ url: value.link });
		setPostId(value.id);
		setSearchQuery(value.link);
		setState('search');
		setShowPopover(false);
	};

	// 入力の変更を監視
	useEffect(() => {
		debouncedSearch(searchQuery);

		return () => {
			debouncedSearch.cancel();
		};
	}, [searchQuery]);

	// useEffectを使ってクリックイベントリスナーを設定
	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	}, []);

	console.log('searchQuery', searchQuery);
	console.log('url', url);

	return (
		<>
			<SearchControl
				label="検索"
				value={searchQuery}
				onChange={(value) => setSearchQuery(value)}
				onKeyDown={handleKeyDown}
				className="search-component"
				placeholder="URLを入力してEnter / サイト内検索の場合はキーワードを入力"
			/>
			{showPopover && !isValidUrl(searchQuery) && (
				<div className="wp-blogcard-editor-site-search-results">
					<ul className="">
						{searchResults.map((post) => (
							<li
								key={post.id}
								// onClick={() => {
								// 	onClick(post);
								// 	setShowPopover(false);
								// }}
								value={post}
								onClick={() => handleClickResult(post)}
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
		</>
	);
};

export default SiteSearch;
