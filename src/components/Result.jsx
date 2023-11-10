import he from 'he'; // 特殊文字のデコード
import Thumbnail from './Thumbnail';
import { faviconUrl, getDomainFromUrl } from '../util';

export default function Result({ attributes }) {
	const { url, thumbnail, json, title, description, thumbnailUrl } = attributes;
	const displayTitle = title || json.title;
	const displayDescription = description || json.description;
	const domain = getDomainFromUrl(url);

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
					{displayTitle && <div className="wp-blogcard-title">{he.decode(displayTitle)}</div>}
					{displayDescription && (
						<div className="wp-blogcard-description">{he.decode(displayDescription)}</div>
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
			<div className="wp-block-humi-blogcard-editor-footer">
				<button className="wp-block-humi-blogcard-editor-link components-button is-secondary button-small">
					<a href={url} target="blank noopener noreferrer">
						リンクを表示
					</a>
				</button>
			</div>
		</div>
	);
}
