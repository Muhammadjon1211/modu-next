import React from 'react';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

interface TuiViewerType {
	content: string;
}

/** client only — always loaded through next/dynamic with ssr: false */
const TuiViewer = (props: TuiViewerType) => {
	const { content } = props;

	return <Viewer initialValue={content} />;
};

export default TuiViewer;
