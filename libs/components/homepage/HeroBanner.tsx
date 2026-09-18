import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Button, Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import BrandTicker from './BrandTicker';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Product } from '../../types/product/product';
import { ProductGroup } from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';
import { formatPrice, getImageUrl, salePrice } from '../../utils';
import { T } from '../../types/common';

const groupHref = (group: ProductGroup) =>
	`/product?input=${JSON.stringify({ page: 1, limit: 12, sort: 'createdAt', direction: 'DESC', search: { group } })}`;

const saleHref = `/product?input=${JSON.stringify({
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: 'DESC',
	search: { options: ['productOnSale'] },
})}`;

const newestInput = { page: 1, limit: 12, sort: 'createdAt', direction: Direction.DESC, search: {} };

const HeroBanner = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	// the newest pieces dress the hero and name the brands in the ticker
	useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: newestInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setProducts(data?.getProducts?.list ?? []),
	});

	const featured = products.filter((ele) => ele.productImages?.length).slice(0, 3);
	const words = t('Wear it your way').split(' ');

	const headline = (
		<h1>
			{words.map((word, index) => (
				<span key={`${word}-${index}`} className={'word'} style={{ animationDelay: `${0.1 + index * 0.09}s` }}>
					{word}
				</span>
			))}
		</h1>
	);

	const photos = (
		<Stack className={`hero-photos count-${featured.length || 1}`}>
			{featured.length ? (
				featured.map((product, index) => (
					<Link
						key={product._id}
						href={{ pathname: '/product/detail', query: { id: product._id } }}
						className={`hero-photo photo-${index}`}
					>
						<img src={getImageUrl(product.productImages[0])} alt={product.productTitle} />
						{index === 0 && (
							<span className={'photo-tag'}>
								<em>{product.productBrand}</em>
								{formatPrice(salePrice(product.productPrice, product.productDiscount))}
							</span>
						)}
					</Link>
				))
			) : (
				<span className={'hero-photo photo-0 placeholder'}>
					<img src={'/img/banner/hero.svg'} alt={''} />
				</span>
			)}
		</Stack>
	);

	const glow = (
		<>
			<span className={'orb orb-a'} />
			<span className={'orb orb-b'} />
			<span className={'grain'} />
		</>
	);

	const tiles = (
		<Stack className={'hero-tiles'}>
			<Link href={groupHref(ProductGroup.CLOTHES)} className={'hero-tile clothes'}>
				<img src={'/img/banner/clothes.svg'} alt={''} />
				<span>{t('Clothes')}</span>
				<ArrowForwardRoundedIcon />
			</Link>
			<Link href={groupHref(ProductGroup.ACCESSORIES)} className={'hero-tile accessories'}>
				<img src={'/img/banner/accessories.svg'} alt={''} />
				<span>{t('Accessories')}</span>
				<ArrowForwardRoundedIcon />
			</Link>
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<>
				<Stack className={'hero-banner'}>
					<Stack className={'hero-main'}>
						{glow}
						<span className={'hero-kicker'}>
							<i />
							{t('New season')}
						</span>
						{headline}
						<Link href={'/product'} className={'hero-cta'}>
							<Button variant={'contained'} color={'secondary'} endIcon={<ArrowForwardRoundedIcon />}>
								{t('Shop now')}
							</Button>
						</Link>
						{photos}
					</Stack>
					{tiles}
				</Stack>
				<BrandTicker products={products} />
			</>
		);
	} else {
		return (
			<>
				<Stack className={'hero-banner'}>
					<Stack className={'container'}>
						<Stack className={'hero-main'}>
							{glow}
							<span className={'hero-kicker'}>
								<i />
								{t('New season')}
							</span>
							{headline}
							<Stack className={'hero-actions'}>
								<Link href={'/product'}>
									<Button
										size={'large'}
										variant={'contained'}
										color={'secondary'}
										endIcon={<ArrowForwardRoundedIcon />}
									>
										{t('Shop now')}
									</Button>
								</Link>
								<Link href={saleHref}>
									<Button size={'large'} variant={'outlined'} className={'ghost'}>
										{t('Sale')}
									</Button>
								</Link>
							</Stack>
							{photos}
						</Stack>
						{tiles}
					</Stack>
				</Stack>
				<BrandTicker products={products} />
			</>
		);
	}
};

export default HeroBanner;
