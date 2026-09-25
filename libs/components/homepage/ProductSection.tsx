import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Skeleton, Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import useProductLike from '../../hooks/useProductLike';

interface ProductSectionType {
	title: string;
	input: ProductsInquiry;
	className?: string;
}

const ProductSection = (props: ProductSectionType) => {
	const { title, input, className = '' } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const { loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
		},
	});

	/** HANDLERS **/
	const likeProductHandler = useProductLike(setProducts);

	if (!loading && !products.length) return null;

	const seeAllHref = `/product?input=${JSON.stringify({ ...input, page: 1, limit: 12 })}`;

	return (
		<Stack className={`product-section ${className}`}>
			<Stack className={'container'}>
				<Stack className={'section-head'}>
					<h2>{t(title)}</h2>
					<Link href={seeAllHref} className={'see-all'}>
						{t('See all')} <ArrowForwardRoundedIcon />
					</Link>
				</Stack>
				<Stack className={device === 'mobile' ? 'product-scroll' : 'product-grid'}>
					{loading && !products.length
						? Array.from({ length: input.limit }).map((_, index) => (
								<Stack key={index} className={'product-card'}>
									<Skeleton variant={'rounded'} className={'skeleton-img'} />
									<Skeleton width={'40%'} />
									<Skeleton width={'80%'} />
								</Stack>
							))
						: products.map((product) => (
								<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
							))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default ProductSection;
