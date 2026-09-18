import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Skeleton, Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { likeTargetProductHandler } from '../../utils';
import { T } from '../../types/common';

interface ProductSectionType {
	title: string;
	input: ProductsInquiry;
	className?: string;
}

const ProductSection = (props: ProductSectionType) => {
	const { title, input, className = '' } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading, refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
		},
	});

	/** HANDLERS **/
	const likeProductHandler = async (id: string) => {
		await likeTargetProductHandler(likeTargetProduct, id, user?._id);
		await refetch({ input });
	};

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
