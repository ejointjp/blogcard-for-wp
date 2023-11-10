import { useState, useEffect, useContext } from '@wordpress/element';
import { SearchControl } from '@wordpress/components';
import debounce from 'lodash.debounce';
import { isValidUrl } from '../util';
import { SharedContext } from '../libs/contextProvider';

export default function SiteSearch({ attributes, setAttributes }) {
	const api = HUMIBLOGCARD.api;
	const { url, json } = attributes;
	const [searchResults, setSearchResults] = useState([]);
	const [showPopover, setShowPopover] = useState(false);
	const { postId, setPostId, searchQuery, setSearchQuery, setState } = useContext(SharedContext);

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

	const fetchData = async () => {
		console.log('fetchされました');
		const params = new URLSearchParams();
		params.append('action', HUMIBLOGCARD.action);
		params.append('nonce', HUMIBLOGCARD.nonce);
		params.append('url', url);
		if (postId) params.append('postId', postId);

		try {
			const res = await fetch(api, { method: 'post', body: params });
			const getJson = await res.json();

			// jsonが空だったら（初回は）デフォルト値を設定
			if (!Object.keys(json).length) {
				await setDefault();
			}
			await setAttributes({ json: getJson });
		} catch (e) {
			setState('fetch-error');
			console.error(e);
		}
	};

	// データがない
	const isDataEmpty = !Object.keys(json).length;
	// 返却されたデータが無効（URLが見つからなかった）
	// const isDataError = json.status === 'error'

	const changeState = () => {
		if (!isDataEmpty) {
			setState('data-success');
		}
	};

	const isExternalLink = (url) => {
		const reg = new RegExp('^(https?:)?//' + location.hostname);

		return !(url.match(reg) || url.charAt(0) === '/');
	};

	// URLが入力されたときの初期設定
	const setDefault = () => {
		if (isExternalLink(url)) {
			setAttributes({
				nofollow: true,
				noreferrer: true,
				external: true,
			});
		}
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

	// URLが有効ならfetch
	useEffect(() => {
		if (isValidUrl(url)) {
			fetchData();
		} else {
			setAttributes({ json: {} });
		}
	}, [url]);

	// jsonに変更があったらstateを変更する
	useEffect(() => {
		changeState();
	}, [json]);

	// useEffectを使ってクリックイベントリスナーを設定
	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	}, []);

	return (
		<div className="wp-block-humi-blogcard-editor-site-search">
			<SearchControl
				className="search-component"
				label="検索"
				placeholder="URLを入力してEnter / サイト内検索の場合はキーワードを入力"
				value={searchQuery}
				onChange={(value) => setSearchQuery(value)}
				onKeyDown={handleKeyDown}
			/>
			{showPopover && !isValidUrl(searchQuery) && (
				<div className="wp-block-humi-blogcard-editor-site-search-results">
					<ul className="">
						{searchResults.map((post) => (
							<li key={post.id} value={post} onClick={() => handleClickResult(post)}>
								{post.title.rendered}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
