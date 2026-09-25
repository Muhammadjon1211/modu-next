import { SyntheticEvent } from 'react';
import moment from 'moment';
import imageCompression from 'browser-image-compression';
import { CURRENCY, Messages, REACT_APP_API_URL } from './config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from './sweetAlert';
import { Message } from './enums/common.enum';
import { Product } from './types/product/product';

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

/** "VISA •••• 4242" — the only form a payment method is ever shown in */
export const paymentLabel = (method: { provider: string; last4: string }): string =>
	`${method.provider} •••• ${method.last4}`;

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

/**
 * Likes answer silently: the heart itself is the feedback, so only a failure shows a toast.
 * Each returns whether the server accepted the toggle, so an optimistic UI can undo on false.
 */
const likeTarget = async (mutation: any, id: string, userId: string, label: string): Promise<boolean> => {
	try {
		if (!id) return false;
		if (!userId) throw new Error(Message.NOT_AUTHENTICATED);
		await mutation({ variables: { input: id } });
		return true;
	} catch (err: any) {
		console.log(`ERROR, ${label}:`, err.message);
		sweetMixinErrorAlert(err.message).then();
		return false;
	}
};

export const likeTargetProductHandler = (likeTargetProduct: any, id: string, userId: string) =>
	likeTarget(likeTargetProduct, id, userId, 'likeTargetProductHandler');

export const likeTargetBoardArticleHandler = (likeTargetBoardArticle: any, id: string, userId: string) =>
	likeTarget(likeTargetBoardArticle, id, userId, 'likeTargetBoardArticleHandler');

export const likeTargetMemberHandler = (likeTargetMember: any, id: string, userId: string) =>
	likeTarget(likeTargetMember, id, userId, 'likeTargetMemberHandler');

/** the product as it will look once the like toggles — flipped locally, before the server answers */
export const toggleProductLike = (product: Product): Product => {
	const liked = !!product?.meLiked?.[0]?.myFavorite;
	return {
		...product,
		productLikes: Math.max(0, (product.productLikes ?? 0) + (liked ? -1 : 1)),
		meLiked: liked ? [] : [{ memberId: '', likeRefId: product._id, myFavorite: true }],
	};
};

/**
 * Shares a link through the phone's share sheet, or copies it where there is none.
 * Returns 'shared', 'copied' or 'cancelled' so the caller can say the right thing.
 */
export const shareLink = async (url: string, title: string): Promise<'shared' | 'copied' | 'cancelled'> => {
	if (typeof navigator !== 'undefined' && navigator.share) {
		try {
			await navigator.share({ title, url });
			return 'shared';
		} catch (err: any) {
			if (err?.name === 'AbortError') return 'cancelled';
			// any other failure falls through to copying
		}
	}

	// the async clipboard API only exists on https / localhost; the textarea path works everywhere
	if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
		await navigator.clipboard.writeText(url);
		return 'copied';
	}
	const field = document.createElement('textarea');
	field.value = url;
	field.setAttribute('readonly', '');
	field.style.position = 'fixed';
	field.style.opacity = '0';
	document.body.appendChild(field);
	field.select();
	document.execCommand('copy');
	document.body.removeChild(field);
	return 'copied';
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
