import { SyntheticEvent } from 'react';
import moment from 'moment';
import imageCompression from 'browser-image-compression';
import { CURRENCY, Messages, REACT_APP_API_URL } from './config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from './sweetAlert';
import { Message } from './enums/common.enum';

export const formatterStr = (value: number | undefined): string => {
	return new Intl.NumberFormat('en-US').format(Math.round(value ?? 0));
};

export const formatPrice = (value: number | undefined): string => `${CURRENCY}${formatterStr(value)}`;

/** the price the buyer actually pays — same rounding rule as the backend totals */
export const salePrice = (price: number, discount: number = 0): number => Math.round(price * (1 - discount / 100));

export const formatDate = (date: Date | string | undefined, format: string = 'YYYY.MM.DD'): string =>
	date ? moment(date).format(format) : '';

export const getImageUrl = (path: string | undefined, fallback: string = '/img/placeholder/product.svg'): string => {
	if (!path) return fallback;
	if (path.startsWith('http') || path.startsWith('/')) return path;
	return `${REACT_APP_API_URL}/${path}`;
};

export const getMemberImage = (path: string | undefined): string => getImageUrl(path, '/img/profile/defaultUser.svg');

/** swaps a broken upload for a local placeholder, once */
export const imageFallbackHandler = (fallback: string = '/img/placeholder/product.svg') => {
	return (e: SyntheticEvent<HTMLImageElement>) => {
		const target = e.currentTarget;
		if (target.dataset.fallback) return;
		target.dataset.fallback = '1';
		target.src = fallback;
	};
};

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

/** validates, then shrinks every image before it goes over the wire */
export const prepareImages = async (files: FileList | File[]): Promise<File[]> => {
	const list = Array.from(files);
	if (list.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) throw new Error(Messages.error5);

	return await Promise.all(
		list.map(async (file) => {
			const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true });
			return new File([compressed], file.name, { type: file.type });
		}),
	);
};

/**************************
 *    SHARED HANDLERS     *
 *************************/

export const likeTargetProductHandler = async (likeTargetProduct: any, id: string, userId: string) => {
	try {
		if (!id) return;
		if (!userId) throw new Error(Message.NOT_AUTHENTICATED);
		await likeTargetProduct({ variables: { input: id } });
		await sweetTopSmallSuccessAlert('success', 800);
	} catch (err: any) {
		console.log('ERROR, likeTargetProductHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string, userId: string) => {
	try {
		if (!id) return;
		if (!userId) throw new Error(Message.NOT_AUTHENTICATED);
		await likeTargetBoardArticle({ variables: { input: id } });
		await sweetTopSmallSuccessAlert('success', 800);
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string, userId: string) => {
	try {
		if (!id) return;
		if (!userId) throw new Error(Message.NOT_AUTHENTICATED);
		await likeTargetMember({ variables: { input: id } });
		await sweetTopSmallSuccessAlert('success', 800);
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const subscribeHandler = async (subscribe: any, id: string, userId: string) => {
	try {
		if (!id) return;
		if (!userId) throw new Error(Message.NOT_AUTHENTICATED);
		await subscribe({ variables: { input: id } });
		await sweetTopSmallSuccessAlert('Followed', 800);
	} catch (err: any) {
		console.log('ERROR, subscribeHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const unsubscribeHandler = async (unsubscribe: any, id: string, userId: string) => {
	try {
		if (!id) return;
		if (!userId) throw new Error(Message.NOT_AUTHENTICATED);
		await unsubscribe({ variables: { input: id } });
		await sweetTopSmallSuccessAlert('Unfollowed', 800);
	} catch (err: any) {
		console.log('ERROR, unsubscribeHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
