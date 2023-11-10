import { useBlockProps } from '@wordpress/block-editor';
import SiteSearch from './SiteSearch';
import Controls from './Controls';
import Display from './Display';

export default function Blogcard({ props }) {
	const blockProps = useBlockProps({ className: 'wp-block-humi-blogcard-editor' });
	const { attributes, setAttributes } = props;

	return (
		<>
			<div {...blockProps}>
				<SiteSearch attributes={attributes} setAttributes={setAttributes} />
				<Display attributes={attributes} />
			</div>

			<Controls attributes={attributes} setAttributes={setAttributes} />
		</>
	);
}
