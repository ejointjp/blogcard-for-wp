import he from 'he'; // 特殊文字のデコード
import Thumbnail from './Thumbnail';
import { faviconUrl, getDomainFromUrl } from '../util';

export default function Result({ attributes }) {
	const { url, thumbnail, json, title, description, thumbnailUrl } = attributes;
	const displayTitle = title || json.title;
	const displayDescription = description || json.description;
	const domain = getDomainFromUrl(url);

	return (
		<article className="humibbc">
			<div className="humibbc-item">
				{!thumbnail && (
					<figure className="humibbc-figure">
						{thumbnailUrl ? (
							<img src={thumbnailUrl} alt="" aria-hidden="true" />
						) : (
							<Thumbnail url={url} thumbnail={json.thumbnail} />
						)}
					</figure>
				)}
				<div className="humibbc-content">
					{displayTitle && <div className="humibbc-title">{he.decode(displayTitle)}</div>}
					{displayDescription && (
						<div className="humibbc-description">{he.decode(displayDescription)}</div>
					)}
					<div className="humibbc-cite">
						{json.hasFavicon === 200 && (
							<img className="humibbc-favicon" src={faviconUrl(url)} alt="" aria-hidden="true" />
						)}
						<div className="humibbc-domain">{domain}</div>
					</div>
				</div>
			</div>
			<div className="humibbc-footer">
				<button className="humibbc-link components-button is-secondary">
					<a href={url} target="blank noopener noreferrer">
						リンク先を表示
					</a>
				</button>
			</div>
		</article>
	);
}
