import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import { Button, CircularProgress, Dialog, IconButton, Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import CameraswitchRoundedIcon from '@mui/icons-material/CameraswitchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/product/product';
import { TRY_ON_PRODUCT } from '../../../apollo/user/mutation';
import { getImageUrl, imageFallbackHandler } from '../../utils';
import { sweetMixinErrorAlert } from '../../sweetAlert';

/** the model works on 3:4 portraits; the photo is cropped to exactly what the frame shows */
const PHOTO_WIDTH = 768;
const PHOTO_HEIGHT = 1024;
/** a run usually takes this long; the bar slows down near the end instead of lying */
const EXPECTED_SECONDS = 30;

type Step = 'camera' | 'preview' | 'loading' | 'result';

interface TryOnDialogType {
	product: Product;
	open: boolean;
	onClose: () => void;
}

/** crops any image or video frame to the 3:4 photo the model expects */
const toPhoto = (source: CanvasImageSource, width: number, height: number): Promise<Blob> => {
	const canvas = document.createElement('canvas');
	canvas.width = PHOTO_WIDTH;
	canvas.height = PHOTO_HEIGHT;
	const scale = Math.max(PHOTO_WIDTH / width, PHOTO_HEIGHT / height);
	const drawWidth = width * scale;
	const drawHeight = height * scale;
	canvas
		.getContext('2d')
		?.drawImage(source, (PHOTO_WIDTH - drawWidth) / 2, (PHOTO_HEIGHT - drawHeight) / 2, drawWidth, drawHeight);
	return new Promise((resolve, reject) =>
		canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('capture failed'))), 'image/jpeg', 0.92),
	);
};

const TryOnDialog = (props: TryOnDialogType) => {
	const { product, open, onClose } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const videoRef = useRef<HTMLVideoElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	const captureRef = useRef<HTMLInputElement>(null);
	const runRef = useRef<number>(0);
	const [step, setStep] = useState<Step>('camera');
	const [cameraReady, setCameraReady] = useState<boolean>(false);
	const [cameraFailed, setCameraFailed] = useState<boolean>(false);
	const [facing, setFacing] = useState<'user' | 'environment'>('user');
	const [photo, setPhoto] = useState<Blob | null>(null);
	const [photoUrl, setPhotoUrl] = useState<string>('');
	const [result, setResult] = useState<string>('');
	const [comparing, setComparing] = useState<boolean>(false);
	const [elapsed, setElapsed] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [tryOnProduct] = useMutation(TRY_ON_PRODUCT);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!open) return;
		setStep('camera');
		setPhoto(null);
		setResult('');
	}, [open]);

	// the camera runs only while its step is on screen; http pages have no camera, the file picker stands in
	useEffect(() => {
		if (!open || step !== 'camera') return;
		setCameraReady(false);
		setCameraFailed(false);
		if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
			setCameraFailed(true);
			return;
		}

		let stream: MediaStream | null = null;
		let cancelled = false;
		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1706 } }, audio: false })
			.then((media) => {
				if (cancelled) return media.getTracks().forEach((track) => track.stop());
				stream = media;
				setCameraFailed(false);
				if (videoRef.current) videoRef.current.srcObject = media;
			})
			.catch((err) => {
				console.log('ERROR, getUserMedia:', err.message);
				setCameraFailed(true);
			});

		return () => {
			cancelled = true;
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [open, step, facing]);

	useEffect(() => {
		if (!photo) return setPhotoUrl('');
		const url = URL.createObjectURL(photo);
		setPhotoUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [photo]);

	useEffect(() => {
		if (step !== 'loading') return;
		setElapsed(0);
		const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
		return () => clearInterval(timer);
	}, [step]);

	/** HANDLERS **/
	const closeHandler = () => {
		runRef.current++; // a run still in flight is dropped when it lands
		onClose();
	};

	const captureHandler = async () => {
		const video = videoRef.current;
		if (!video || !video.videoWidth) return;
		setPhoto(await toPhoto(video, video.videoWidth, video.videoHeight));
		setStep('preview');
	};

	const fileHandler = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = ''; // the same file can be picked again after a retake
		if (!file) return;
		try {
			const url = URL.createObjectURL(file);
			const image = new Image();
			image.src = url;
			await image.decode(); // browsers apply the EXIF rotation when drawing
			const blob = await toPhoto(image, image.naturalWidth, image.naturalHeight);
			URL.revokeObjectURL(url);
			setPhoto(blob);
			setStep('preview');
		} catch (err: any) {
			console.log('ERROR, fileHandler:', err.message);
			sweetMixinErrorAlert(t('Please provide jpg, png, or jpeg images!')).then();
		}
	};

	const tryOnHandler = async () => {
		if (!photo) return;
		const run = ++runRef.current;
		try {
			setStep('loading');
			const file = new File([photo], 'photo.jpg', { type: 'image/jpeg' });
			const { data } = await tryOnProduct({ variables: { productId: product._id, file } });
			if (run !== runRef.current) return;
			setResult(data?.tryOnProduct?.image ?? '');
			setStep('result');
		} catch (err: any) {
			if (run !== runRef.current) return;
			console.log('ERROR, tryOnHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
			setStep('preview');
		}
	};

	const retakeHandler = () => {
		setPhoto(null);
		setResult('');
		setStep('camera');
	};

	const saveHandler = () => {
		const link = document.createElement('a');
		link.href = result;
		link.download = `modu-try-on-${product._id}.jpg`;
		link.click();
	};

	const progress = Math.min(95, (100 * elapsed) / (elapsed + EXPECTED_SECONDS * 0.6));

	return (
		<Dialog
			open={open}
			onClose={step === 'loading' ? undefined : closeHandler}
			fullScreen={device === 'mobile'}
			maxWidth={'sm'}
			className={'tryon-dialog'}
		>
			<Stack className={'tryon-head'}>
				<img src={getImageUrl(product.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
				<Stack className={'tryon-title'}>
					<span>{product.productBrand}</span>
					<strong>{product.productTitle}</strong>
				</Stack>
				<IconButton aria-label={t('Close')} onClick={closeHandler}>
					<CloseRoundedIcon />
				</IconButton>
			</Stack>

			<Stack className={'tryon-stage'}>
				{step === 'camera' &&
					(cameraFailed ? (
						<Stack className={'tryon-empty'}>
							<CameraAltRoundedIcon />
						</Stack>
					) : (
						<>
							<video
								ref={videoRef}
								className={facing === 'user' ? 'mirrored' : ''}
								autoPlay
								playsInline
								muted
								onLoadedData={() => setCameraReady(true)}
							/>
							{!cameraReady && <CircularProgress className={'tryon-spinner'} color={'inherit'} />}
							{/* where the upper body should sit — the model dresses shoulders to hips */}
							<svg className={'tryon-guide'} viewBox={'0 0 300 400'} aria-hidden>
								<ellipse cx={'150'} cy={'78'} rx={'34'} ry={'44'} />
								<path d={'M48 400 V212 Q48 150 112 140 Q150 160 188 140 Q252 150 252 212 V400'} />
							</svg>
						</>
					))}

				{(step === 'preview' || step === 'loading') && photoUrl && (
					<img className={step === 'loading' ? 'working' : ''} src={photoUrl} alt={''} />
				)}

				{step === 'loading' && (
					<Stack className={'tryon-progress'}>
						<AutoAwesomeRoundedIcon />
						<strong>{t('Dressing you up')}</strong>
						<span>
							{elapsed}s / ~{EXPECTED_SECONDS}s
						</span>
						<div className={'bar'}>
							<div style={{ width: `${progress}%` }} />
						</div>
					</Stack>
				)}

				{step === 'result' && (
					<img
						className={'result'}
						src={comparing ? photoUrl : result}
						alt={product.productTitle}
						onPointerDown={() => setComparing(true)}
						onPointerUp={() => setComparing(false)}
						onPointerLeave={() => setComparing(false)}
						onContextMenu={(e) => e.preventDefault()}
						draggable={false}
					/>
				)}
				{step === 'result' && <span className={'tryon-hint'}>{comparing ? t('Original') : t('Hold to compare')}</span>}
			</Stack>

			<input ref={fileRef} type={'file'} accept={'image/*'} hidden onChange={fileHandler} />
			{/* no live camera (e.g. a plain http page): phones open their own camera app instead */}
			<input ref={captureRef} type={'file'} accept={'image/*'} capture={'user'} hidden onChange={fileHandler} />

			<Stack className={'tryon-actions'}>
				{step === 'camera' && (
					<>
						<IconButton className={'side-btn'} aria-label={t('Upload photo')} onClick={() => fileRef.current?.click()}>
							<PhotoLibraryOutlinedIcon />
						</IconButton>
						<button
							type={'button'}
							className={'shutter'}
							aria-label={t('Take photo')}
							disabled={!cameraFailed && !cameraReady}
							onClick={cameraFailed ? () => captureRef.current?.click() : captureHandler}
						>
							<span />
						</button>
						<IconButton
							className={'side-btn'}
							aria-label={t('Switch camera')}
							disabled={cameraFailed}
							onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}
						>
							<CameraswitchRoundedIcon />
						</IconButton>
					</>
				)}
				{step === 'preview' && (
					<>
						<Button variant={'outlined'} size={'large'} onClick={retakeHandler}>
							{t('Retake')}
						</Button>
						<Button variant={'contained'} size={'large'} startIcon={<AutoAwesomeRoundedIcon />} onClick={tryOnHandler}>
							{t('Try on')}
						</Button>
					</>
				)}
				{step === 'result' && (
					<>
						<Button variant={'outlined'} size={'large'} onClick={retakeHandler}>
							{t('Retake')}
						</Button>
						<Button variant={'contained'} size={'large'} startIcon={<FileDownloadOutlinedIcon />} onClick={saveHandler}>
							{t('Save')}
						</Button>
					</>
				)}
			</Stack>
		</Dialog>
	);
};

export default TryOnDialog;
