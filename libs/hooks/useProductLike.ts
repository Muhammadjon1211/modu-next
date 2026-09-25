import { Dispatch, SetStateAction } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Product } from '../types/product/product';
import { likeTargetProductHandler, toggleProductLike } from '../utils';

interface UseProductLikeOptions {
	/** drop the card from the list on unlike — the favorites page */
	removeOnUnlike?: boolean;
}

/**
 * Optimistic like for a list of product cards: the heart and count flip the moment
 * they are tapped, the server call runs behind them, and a failure flips them back.
 * The list is never refetched, so a card stays exactly where it was.
 */
const useProductLike = (setProducts: Dispatch<SetStateAction<Product[]>>, options: UseProductLikeOptions = {}) => {
	const user = useReactiveVar(userVar);
	// no-cache: the answer must not rewrite the cached list under the optimistic flip
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT, { fetchPolicy: 'no-cache' });

	return async (id: string) => {
		// a guest gets the "login first" toast and nothing moves
		if (!user?._id) {
			await likeTargetProductHandler(likeTargetProduct, id, user?._id);
			return;
		}

		// filled in by the state updater, so an undo can put the card back in its slot
		const removed: { product?: Product; index: number } = { index: -1 };
		const flip = (list: Product[]) =>
			list.map((product) => (product._id === id ? toggleProductLike(product) : product));

		if (options.removeOnUnlike) {
			setProducts((list) => {
				const index = list.findIndex((product) => product._id === id);
				if (index < 0) return list;
				removed.product = list[index];
				removed.index = index;
				return list.filter((product) => product._id !== id);
			});
		} else {
			setProducts(flip);
		}

		const saved = await likeTargetProductHandler(likeTargetProduct, id, user._id);
		if (saved) return;

		// the server said no — put the card back the way it was
		if (options.removeOnUnlike) {
			const { product, index } = removed;
			if (product) setProducts((list) => [...list.slice(0, index), product, ...list.slice(index)]);
		} else {
			setProducts(flip);
		}
	};
};

export default useProductLike;
