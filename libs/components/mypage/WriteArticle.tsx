import React, { ChangeEvent, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import { Button, CircularProgress, IconButton, Stack, TextField } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { CREATE_BOARD_ARTICLE, IMAGE_UPLOADER } from '../../../apollo/user/mutation';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { articleCategoryLabels } from '../../config';
import { getImageUrl, imageFallbackHandler, prepareImages } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import type { Editor } from '@toast-ui/react-editor';

const TuiEditor = dynamic(() => import('../community/TuiEditor'), {
	ssr: false,
	loading: () => (
		<Stack className={'loading-box small'}>
			<CircularProgress size={24} color={'inherit'} />
		</Stack>
	),
});

const WriteArticle = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const editorRef = useRef<Editor | null>(null);
	const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.LOOKBOOK);
	const [title, setTitle] = useState<string>('');
	const [image, setImage] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	/** HANDLERS **/
	const uploadCoverHandler = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			const files = e.target.files;
			if (!files?.length) return;
			const [file] = await prepareImages(files);

			setUploading(true);
			const { data } = await imageUploader({ variables: { file, target: 'article' } });
			setImage(data?.imageUploader ?? '');
		} catch (err: any) {
			console.log('ERROR, uploadCoverHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	const submitHandler = async () => {
		try {
			const content = editorRef.current?.getInstance().getHTML()?.trim() ?? '';
			const plain = content.replace(/<[^>]*>/g, '').trim();
			if (title.trim().length < 3) throw new Error(t('Title is too short'));
			if (plain.length < 3 && !content.includes('<img')) throw new Error(t('Content is too short'));

			setSaving(true);
			const input: any = { articleCategory: category, articleTitle: title.trim(), articleContent: content };
			if (image) input.articleImage = image;
			const { data } = await createBoardArticle({ variables: { input } });
			await sweetTopSuccessAlert(t('Posted'), 1000);
			await router.push({ pathname: '/community/detail', query: { id: data?.createBoardArticle?._id } });
		} catch (err: any) {
			console.log('ERROR, submitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSaving(false);
		}
	};

	return (
		<Stack className={'write-article'}>
			<h2 className={'my-title'}>{t('Write')}</h2>
			<Stack className={'chip-list'}>
				{Object.values(BoardArticleCategory).map((ele) => (
					<button key={ele} className={`chip ${category === ele ? 'active' : ''}`} onClick={() => setCategory(ele)}>
						{t(articleCategoryLabels[ele])}
					</button>
				))}
			</Stack>
			<TextField
				fullWidth
				placeholder={t('Title')}
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				inputProps={{ maxLength: 100 }}
				className={'title-input'}
			/>
			<Stack className={'cover-edit'}>
				{image ? (
					<Stack className={'cover-preview'}>
						<img
							src={getImageUrl(image, '/img/placeholder/article.svg')}
							alt={''}
							onError={imageFallbackHandler('/img/placeholder/article.svg')}
						/>
						<IconButton size={'small'} className={'remove-btn'} onClick={() => setImage('')}>
							<CloseRoundedIcon fontSize={'small'} />
						</IconButton>
					</Stack>
				) : (
					<Button
						component={'label'}
						variant={'outlined'}
						startIcon={<AddPhotoAlternateOutlinedIcon />}
						disabled={uploading}
					>
						{uploading ? <CircularProgress size={18} color={'inherit'} /> : t('Cover image')}
						<input hidden type={'file'} accept={'image/png,image/jpeg'} onChange={uploadCoverHandler} />
					</Button>
				)}
			</Stack>
			<Stack className={'editor-box'}>
				<TuiEditor editorRef={editorRef} />
			</Stack>
			<Stack className={'form-actions'}>
				<Button variant={'contained'} size={'large'} onClick={submitHandler} disabled={saving || uploading}>
					{t('Publish')}
				</Button>
			</Stack>
		</Stack>
	);
};

export default WriteArticle;
