import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { GET_RELATED_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface RelatedProductsType {
	productId: string;
}

const RelatedProducts = (props: RelatedProductsType) => {
	const { productId } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_RELATED_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: productId, limit: 4 },
		skip: !productId,
		onCompleted: (data: T) => {
			setProducts(data?.getRelatedProducts?.list ?? []);
		},
	});

	if (!products.length) return null;

	return (
		<Stack className={'related-products'}>
			<Stack className={'section-head'}>
				<h2>{t('You may also like')}</h2>
			</Stack>
			<Stack className={device === 'mobile' ? 'product-scroll' : 'product-grid'}>
				{products.map((product) => (
					<ProductCard key={product._id} product={product} />
				))}
			</Stack>
		</Stack>
	);
};

export default RelatedProducts;
