import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { Product } from '../../types/product/product';
import { ProductStatus } from '../../enums/product.enum';
import { formatPrice, formatterStr, getImageUrl, imageFallbackHandler, salePrice } from '../../utils';

interface ProductCardType {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
	size?: 'normal' | 'small';
}

const ProductCard = (props: ProductCardType) => {
	const { product, likeProductHandler, myFavorites, size = 'normal' } = props;
	const { t } = useTranslation('common');
	const liked: boolean = myFavorites || !!product?.meLiked?.[0]?.myFavorite;
	const soldOut: boolean = product?.productStatus === ProductStatus.SOLD_OUT || product?.productStock <= 0;
	const href = { pathname: '/product/detail', query: { id: product?._id } };

	return (
		<Stack className={`product-card ${size}`}>
			<Link href={href} className={'card-img'}>
				<img
					src={getImageUrl(product?.productImages?.[0])}
					alt={product?.productTitle}
					onError={imageFallbackHandler()}
					loading={'lazy'}
				/>
				{product?.productDiscount > 0 && <span className={'badge sale'}>-{product.productDiscount}%</span>}
				{soldOut && <span className={'sold-out'}>{t('Sold out')}</span>}
			</Link>
			{likeProductHandler && (
				<IconButton
					className={`like-btn ${liked ? 'liked' : ''}`}
					aria-label={'like'}
					onClick={() => likeProductHandler(product?._id)}
				>
					{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</IconButton>
			)}
			<Stack className={'card-info'}>
				<Stack className={'brand-row'}>
					<span className={'brand'}>{product?.productBrand}</span>
					{product?.productRatingCount > 0 && (
						<span className={'rating'}>
							<StarRoundedIcon />
							{product.productRating.toFixed(1)}
							<em>({product.productRatingCount})</em>
						</span>
					)}
				</Stack>
				<Link href={href} className={'title'}>
					{product?.productTitle}
				</Link>
				<Stack className={'price-row'}>
					<strong className={product?.productDiscount > 0 ? 'on-sale' : ''}>
						{formatPrice(salePrice(product?.productPrice, product?.productDiscount))}
					</strong>
					{product?.productDiscount > 0 && <s>{formatPrice(product?.productPrice)}</s>}
				</Stack>
				{product?.productSales > 0 && (
					<span className={'sold-count'}>
						{t('Sold')} {formatterStr(product.productSales)}
					</span>
				)}
			</Stack>
		</Stack>
	);
};

export default ProductCard;
