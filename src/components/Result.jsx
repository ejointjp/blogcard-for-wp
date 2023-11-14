import he from 'he'; // 特殊文字のデコード
import Thumbnail from './Thumbnail';
import { faviconUrl, getDomainFromUrl } from '../util';

export default function Result({ attributes }) {
	const { url, thumbnail, json, title, description, thumbnailUrl } = attributes;
	const displayTitle = title || json.title;
	const displayDescription = description || json.description;
	const domain = getDomainFromUrl(url);

	return (
		<article className="litobc">
			<div className="litobc-item">
				{!thumbnail && (
					<figure className="litobc-figure">
						{thumbnailUrl ? (
							<img src={thumbnailUrl} alt="" aria-hidden="true" />
						) : (
							<Thumbnail url={url} thumbnail={json.thumbnail} />
						)}
					</figure>
				)}
				<div className="litobc-content">
					{displayTitle && <div className="litobc-title">{he.decode(displayTitle)}</div>}
					{displayDescription && (
						<div className="litobc-description">{he.decode(displayDescription)}</div>
					)}
					<div className="litobc-cite">
						{json.hasFavicon === 200 && (
							<img className="litobc-favicon" src={faviconUrl(url)} alt="" aria-hidden="true" />
						)}
						<div className="litobc-domain">{domain}</div>
					</div>
				</div>
			</div>
			<div className="litobc-footer">
				<button className="litobc-link components-button is-secondary">
					<a href={url} target="blank noopener noreferrer">
						リンク先を表示
					</a>
				</button>
			</div>
		</article>
	);
}
