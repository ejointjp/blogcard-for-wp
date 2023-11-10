import { PlainText, useBlockProps } from '@wordpress/block-editor';
import { useContext } from '@wordpress/element';
import { SharedContext } from '../libs/contextProvider';
import ReactLoading from 'react-loading';

import SiteSearch from './SiteSearch';
import Controls from './Controls';
import Result from './Result';

export default function Blogcard({ props }) {
	const blockProps = useBlockProps({ className: 'wp-blogcard-editor' });
	const { attributes, setAttributes } = props;

	const { state } = useContext(SharedContext);

	const InfoText = (props) => {
		return <div className="text-sm text-gray-600 mt-2">{props.children}</div>;
	};

	const Display = () => {
		switch (state) {
			case 'url-empty':
				return <InfoText>URLまたはキーワードを入力してください</InfoText>;

			case 'url-invalid':
				return;
			// return <InfoText>検索結果はありません</InfoText>;

			case 'search':
				return (
					<ReactLoading
						class="mt-2"
						type="spin"
						color="rgb(253 210 59)"
						width="20px"
						height="20px"
					/>
				);

			case 'data-success':
				return <Result attributes={attributes} />;

			case 'fetch-error':
				return (
					<>
						<InfoText>データを取得できませんでした</InfoText>
					</>
				);

			default:
				return '';
		}
	};

	return (
		<>
			<div {...blockProps}>
				<div className="wp-blogcard-editor-site-search">
					<SiteSearch attributes={attributes} setAttributes={setAttributes} />
				</div>
				<Display />
			</div>

			<Controls attributes={attributes} setAttributes={setAttributes} />
		</>
	);
}
