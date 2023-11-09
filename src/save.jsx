import he from "he";
import Thumbnail from "./components/Thumbnail";
import { getDomainFromUrl, faviconUrl } from "./util";
const { useBlockProps } = wp.blockEditor;

export default function save(props) {
	const blockProps = useBlockProps.save();
	const {
		attributes: {
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
		},
	} = props;

	const rels = [];
	if (noopener) rels.push("noopener");
	if (nofollow) rels.push("nofollow");
	if (noreferrer) rels.push("noreferrer");
	if (external) rels.push("external");
	if (sponsored) rels.push("sponsored");
	if (ugc) rels.push("ugc");

	const domain = getDomainFromUrl(url);
	// データがない
	const isDataEmpty = !Object.keys(json).length;

	const displayTitle = title || json.title;
	const displayDescription = description || json.description;

	return (
		<>
			{!isDataEmpty && (
				<div {...blockProps}>
					<blockquote className="wp-blogcard" cite={url}>
						<a
							className="wp-blogcard-item"
							href={url}
							target={target !== "" ? target : null}
							rel={rels.join(" ")}
						>
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
									<div className="wp-blogcard-title">
										{he.decode(displayTitle)}
									</div>
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
						</a>
					</blockquote>
				</div>
			)}
		</>
	);
}
