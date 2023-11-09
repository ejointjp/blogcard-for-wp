import { useState, useEffect } from "@wordpress/element";

import {
	BaseControl,
	Button,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from "@wordpress/components";
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";

export default function Controls({ attributes, setAttributes }) {
	const ALLOWED_MEDIA_TYPES = ["image"];
	const api = wpbcAjaxValues.api;

	const {
		url,
		target,
		nofollow,
		noopener,
		noreferrer,
		external,
		sponsored,
		ugc,
		thumbnail,
		json,
		title,
		description,
		thumbnailUrl,
	} = attributes;

	const [clearText, setClearText] = useState(""); // キャッシュをクリアしたときのメッセージ

	const removeCache = async () => {
		const params = new URLSearchParams();
		params.append("action", wpbcAjaxValues.actionRemoveCache);
		params.append("nonce", wpbcAjaxValues.nonceRemoveCache);
		params.append("url", url);

		const res = await fetch(api, { method: "post", body: params });
		const getText = await res.text();
		// cacheクリアが完了したら
		if (getText === "1") setClearText("キャッシュを削除しました");
	};

	useEffect(() => {
		if (target !== "") setAttributes({ noopener: true });
	}, [target]);

	return (
		<InspectorControls>
			<PanelBody
				title={"ブロック設定"}
				className="su-components-panel__body su-components-panel__body--wp-blogcard"
			>
				<SelectControl
					label="target属性"
					value={target}
					onChange={(value) => setAttributes({ target: value })}
					options={[
						{ value: "", label: "なし" },
						{ value: "_blank", label: "_blank (別ウインドウ・タブ)" },
						{ value: "_new", label: "_new (ひとつの別ウインドウ・タブ)" },
						{ value: "_self", label: "_self (同じウインドウ・タブ)" },
					]}
				/>

				<ToggleControl
					label="external を追加"
					help=""
					checked={external}
					onChange={(value) => setAttributes({ external: value })}
				/>
				<ToggleControl
					label="noopener を追加"
					help="target属性があれば強制的に有効になります"
					checked={noopener}
					disabled={target !== ""}
					onChange={(value) =>
						setAttributes({ noopener: target === "" ? value : true })
					}
				/>
				<ToggleControl
					label="rel=nofollow を追加"
					help=""
					checked={nofollow}
					onChange={(value) => setAttributes({ nofollow: value })}
				/>
				<ToggleControl
					label="rel=noreferrer を追加"
					help=""
					checked={noreferrer}
					onChange={(value) => setAttributes({ noreferrer: value })}
				/>
				<ToggleControl
					label="rel=sponsored を追加"
					help=""
					checked={sponsored}
					onChange={(value) => setAttributes({ sponsored: value })}
				/>
				<ToggleControl
					label="rel=ugc を追加"
					help=""
					checked={ugc}
					onChange={(value) => setAttributes({ ugc: value })}
				/>

				<ToggleControl
					label="サムネイルを表示しない"
					help=""
					checked={thumbnail}
					onChange={(value) => {
						setAttributes({ thumbnail: value });
					}}
				/>

				<BaseControl label="キャッシュを削除">
					<div className="cached-btn">
						<Button
							className="components-button is-secondary"
							onClick={removeCache}
						>
							キャッシュを削除
						</Button>
						{json.cached && <span>Cached</span>}
					</div>
					{clearText && <div className="mt-1">{clearText}</div>}
				</BaseControl>

				<TextControl
					label="タイトルを手動で入力"
					value={title}
					onChange={(value) => {
						setAttributes({ title: value });
					}}
				/>
				<TextControl
					label="説明文を手動で入力"
					value={description}
					onChange={(value) => {
						setAttributes({ description: value });
					}}
				/>

				<BaseControl label="サムネイルを手動で設定">
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(value) => {
								setAttributes({ thumbnailUrl: value.url });
							}}
							allowedTypes={ALLOWED_MEDIA_TYPES}
							value={thumbnailUrl}
							render={({ open }) => (
								<Button
									onClick={open}
									className="editor-post-featured-image__toggle"
								>
									メディアライブラリを開く
								</Button>
							)}
						/>
					</MediaUploadCheck>
				</BaseControl>
			</PanelBody>
		</InspectorControls>
	);
}
