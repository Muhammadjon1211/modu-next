import React, { MutableRefObject } from 'react';
import { useMutation } from '@apollo/client';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { IMAGE_UPLOADER } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface TuiEditorType {
	/** a plain prop, not `ref` — next/dynamic does not forward refs */
	editorRef: MutableRefObject<Editor | null>;
	initialValue?: string;
	height?: string;
}

/** client only — always loaded through next/dynamic with ssr: false */
const TuiEditor = (props: TuiEditorType) => {
	const { editorRef, initialValue = '', height = '480px' } = props;

	/** APOLLO REQUESTS **/
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	/** HANDLERS **/
	const uploadImageHandler = async (blob: Blob | File, callback: (url: string, alt: string) => void) => {
		try {
			const { data } = await imageUploader({ variables: { file: blob, target: 'article' } });
			callback(`${REACT_APP_API_URL}/${data?.imageUploader}`, '');
		} catch (err: any) {
			console.log('ERROR, uploadImageHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Editor
			ref={editorRef}
			initialValue={initialValue || ' '}
			initialEditType={'wysiwyg'}
			previewStyle={'vertical'}
			height={height}
			useCommandShortcut
			hideModeSwitch
			toolbarItems={[
				['heading', 'bold', 'italic', 'strike'],
				['hr', 'quote'],
				['ul', 'ol'],
				['image', 'link'],
			]}
			hooks={{ addImageBlobHook: uploadImageHandler }}
		/>
	);
};

export default TuiEditor;
