import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { IconButton, Stack } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { OrderItem } from '../../types/order/order';
import { Product } from '../../types/product/product';
import { ProductStatus } from '../../enums/product.enum';
import { formatPrice, getImageUrl, imageFallbackHandler, salePrice } from '../../utils';

/** a line is unbuyable when the product is gone, or a size / color was never chosen */
export const cartLineProblem = (item: OrderItem, product?: Product): string => {
	if (!product || product.productStatus !== ProductStatus.ACTIVE || product.productStock <= 0) return 'Sold out';
	if (product.productSizes?.length > 1 && !item.itemSize) return 'Choose a size';
	if (product.productColors?.length > 1 && !item.itemColor) return 'Choose a color';
	return '';
};

interface CartItemType {
	item: OrderItem;
	product?: Product;
	busy?: boolean;
	changeQuantityHandler: (item: OrderItem, quantity: number) => void;
	removeItemHandler: (item: OrderItem) => void;
}

const CartItem = (props: CartItemType) => {
	const { item, product, busy, changeQuantityHandler, removeItemHandler } = props;
	const { t } = useTranslation('common');
	const problem = cartLineProblem(item, product);
	const unit = salePrice(item.itemPrice, item.itemDiscount);
	const href = { pathname: '/product/detail', query: { id: item.productId } };
	const variant = [item.itemSize, item.itemColor ? t(item.itemColor) : ''].filter((ele) => ele).join(' · ');

	return (
		<Stack className={`cart-item ${problem ? 'unavailable' : ''}`}>
			<Link href={href} className={'item-img'}>
				<img
					src={getImageUrl(product?.productImages?.[0])}
					alt={product?.productTitle}
					onError={imageFallbackHandler()}
				/>
			</Link>
			<Stack className={'item-info'}>
				<span className={'brand'}>{product?.productBrand}</span>
				<Link href={href} className={'title'}>
					{product?.productTitle}
				</Link>
				{variant && <span className={'variant'}>{variant}</span>}
				<Stack className={'unit-price'}>
					<strong>{formatPrice(unit)}</strong>
					{item.itemDiscount > 0 && <s>{formatPrice(item.itemPrice)}</s>}
				</Stack>
				{problem && <span className={'warn'}>{t(problem)}</span>}
			</Stack>
			<Stack className={'qty-stepper'}>
				<IconButton
					size={'small'}
					disabled={busy || item.itemQuantity <= 1}
					onClick={() => changeQuantityHandler(item, item.itemQuantity - 1)}
				>
					<RemoveRoundedIcon fontSize={'small'} />
				</IconButton>
				<span>{item.itemQuantity}</span>
				<IconButton
					size={'small'}
					disabled={busy || !!problem || item.itemQuantity >= (product?.productStock ?? 0)}
					onClick={() => changeQuantityHandler(item, item.itemQuantity + 1)}
				>
					<AddRoundedIcon fontSize={'small'} />
				</IconButton>
			</Stack>
			<strong className={'line-total'}>{formatPrice(unit * item.itemQuantity)}</strong>
			<IconButton className={'remove-btn'} disabled={busy} onClick={() => removeItemHandler(item)}>
				<CloseRoundedIcon fontSize={'small'} />
			</IconButton>
		</Stack>
	);
};

export default CartItem;
