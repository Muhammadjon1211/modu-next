import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Product } from '../../types/product/product';
import { ProductStatus } from '../../enums/product.enum';
import { formatPrice, getImageUrl, imageFallbackHandler, salePrice } from '../../utils';

interface FavoriteRowType {
	product: Product;
	/** removes it from favorites */
	unlikeHandler: (id: string) => void;
}

/** a saved product as one row: photo, what it is, what it costs, and the heart to let it go */
const FavoriteRow = (props: FavoriteRowType) => {
	const { product, unlikeHandler } = props;
	const { t } = useTranslation('common');
	const href = { pathname: '/product/detail', query: { id: product._id } };
	const soldOut = product.productStatus === ProductStatus.SOLD_OUT || product.productStock <= 0;
	const lowStock = !soldOut && product.productStock <= 5;
	const shop = product.memberData?.memberShopName || product.memberData?.memberNick;
	// most shops sell their own label; naming it twice adds nothing
	const showShop = !!shop && shop.toLowerCase() !== product.productBrand?.toLowerCase();

	return (
		<Stack className={`favorite-row ${soldOut ? 'sold-out' : ''}`}>
			<Link href={href} className={'row-img'}>
				<img
					src={getImageUrl(product.productImages?.[0])}
					alt={product.productTitle}
					onError={imageFallbackHandler()}
					loading={'lazy'}
				/>
				{product.productDiscount > 0 && <span className={'badge sale'}>-{product.productDiscount}%</span>}
			</Link>

			<Link href={href} className={'row-info'}>
				<span className={'brand'}>{product.productBrand}</span>
				<strong className={'title'}>{product.productTitle}</strong>
				<span className={'meta'}>
					{showShop && <em>{shop}</em>}
					{product.productRatingCount > 0 && (
						<span className={'rating'}>
							<StarRoundedIcon />
							{product.productRating.toFixed(1)}
						</span>
					)}
				</span>
				<span className={'price-row'}>
					<strong className={product.productDiscount > 0 ? 'on-sale' : ''}>
						{formatPrice(salePrice(product.productPrice, product.productDiscount))}
					</strong>
					{product.productDiscount > 0 && <s>{formatPrice(product.productPrice)}</s>}
				</span>
				{soldOut ? (
					<span className={'stock out'}>{t('Sold out')}</span>
				) : lowStock ? (
					<span className={'stock low'}>{t('Only {{count}} left', { count: product.productStock })}</span>
				) : null}
			</Link>

			<Stack className={'row-actions'}>
				<IconButton
					className={'unlike-btn'}
					aria-label={t('Remove from favorites')}
					onClick={() => unlikeHandler(product._id)}
				>
					<FavoriteRoundedIcon />
				</IconButton>
				<Link href={href} className={'open-btn'} aria-label={t('View')}>
					<ChevronRightRoundedIcon />
				</Link>
			</Stack>
		</Stack>
	);
};

export default FavoriteRow;
