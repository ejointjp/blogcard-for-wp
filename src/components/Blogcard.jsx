import { PlainText, useBlockProps } from "@wordpress/block-editor";
import { useEffect } from "@wordpress/element";
import { useContext } from "@wordpress/element";
import { SharedContext } from "../libs/contextProvider";
import ReactLoading from "react-loading";
import he from "he"; // 特殊文字のデコード
import Thumbnail from "./Thumbnail";
import SiteSearch from "./SiteSearch";
import Controls from "./Controls";
import { getDomainFromUrl, isValidUrl, faviconUrl } from "../util";

export default function Blogcard({ props }) {
	const api = wpbcAjaxValues.api;
	const blockProps = useBlockProps({ className: "wp-blogcard-editor" });
	const { attributes, setAttributes } = props;
	const { url, thumbnail, json, title, description, thumbnailUrl } = attributes;
	const { postId, state, setState, setTempUrl } = useContext(SharedContext);
	console.log("json", json);

	const fetchData = async () => {
		const params = new URLSearchParams();
		params.append("action", wpbcAjaxValues.action);
		params.append("nonce", wpbcAjaxValues.nonce);
		params.append("url", url);
		if (postId) params.append("postId", postId);

		try {
			const res = await fetch(api, { method: "post", body: params });
			const getJson = await res.json();

			// jsonが空だったら（初回は）デフォルト値を設定
			if (!Object.keys(json).length) {
				await setDefault();
			}
			await setAttributes({ json: getJson });
		} catch (e) {
			setState("fetch-error");
			console.error(e);
		}
	};

	const changeState = () => {
		if (!isDataEmpty) {
			setState("data-success");
		}
	};

	const isExternalLink = (url) => {
		const reg = new RegExp("^(https?:)?//" + location.hostname);

		return !(url.match(reg) || url.charAt(0) === "/");
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

	// データがない
	const isDataEmpty = !Object.keys(json).length;
	// 返却されたデータが無効（URLが見つからなかった）
	// const isDataError = json.status === 'error'

	const domain = getDomainFromUrl(url);

	const InfoText = (props) => {
		return <div className="text-sm text-gray-600 mt-2">{props.children}</div>;
	};

	const Display = () => {
		switch (state) {
			case "url-empty":
				return <InfoText>URLまたはキーワードを入力してください</InfoText>;

			case "url-invalid":
				return;
			// return <InfoText>検索結果はありません</InfoText>;

			case "search":
				return (
					<ReactLoading
						class="mt-2"
						type="spin"
						color="rgb(253 210 59)"
						width="20px"
						height="20px"
					/>
				);

			case "data-success":
				return <Result />;

			case "fetch-error":
				return (
					<>
						<InfoText>データを取得できませんでした</InfoText>
					</>
				);

			default:
				return "";
		}
	};

	const Result = () => {
		const displayTitle = title || json.title;
		const displayDescription = description || json.description;

		return (
			<div className="wp-blogcard">
				<div className="wp-blogcard-item">
					{!thumbnail && (
						<figure className="wp-blogcard-figure">
							{thumbnailUrl ? (
								<img src={thumbnailUrl} alt="" aria-hidden="true" />
							) : (
								<Thumbnail url={url} thumbnail={json.thumbnail} />
							)}
						</figure>
					)}
					<div className="wp-blogcard-content">
						{displayTitle && (
							<div className="wp-blogcard-title">{he.decode(displayTitle)}</div>
						)}
						{displayDescription && (
							<div className="wp-blogcard-description">
								{he.decode(displayDescription)}
							</div>
						)}
						<div className="wp-blogcard-cite">
							{json.hasFavicon === 200 && (
								<img
									className="wp-blogcard-favicon"
									src={faviconUrl(url)}
									alt=""
									aria-hidden="true"
								/>
							)}
							<div className="wp-blogcard-domain">{domain}</div>
						</div>
					</div>
				</div>
				<div className="wp-blogcard-editor-footer">
					<button className="wp-blogcard-editor-link components-button is-secondary button-small">
						<a href={url} target="blank noopener noreferrer">
							リンクを表示
						</a>
					</button>
				</div>
			</div>
		);
	};

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

	return (
		<>
			<div {...blockProps}>
				<div className="wp-blogcard-editor-site-search">
					<SiteSearch
						// onClick={onClickSiteSearch}
						onChange={(value) => setTempUrl(value)}
						attributes={attributes}
						setAttributes={setAttributes}
					/>
					{/* <PlainText
						className="wp-blogcard-editor-input"
						tagName="input"
						placeholder="URLを入力してEnter"
						value={tempUrl}
						onChange={(value) => setTempUrl(value)}
						onKeyDown={onKeyDown}
					/> */}
				</div>
				<Display />
			</div>

			<Controls attributes={attributes} setAttributes={setAttributes} />
		</>
	);
}
