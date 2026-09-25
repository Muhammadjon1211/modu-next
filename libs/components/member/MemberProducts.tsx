import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Pagination, Stack } from '@mui/material';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { T } from '../../types/common';
import useProductLike from '../../hooks/useProductLike';

interface MemberProductsType {
	memberId: string;
}

const MemberProducts = (props: MemberProductsType) => {
	const { memberId } = props;
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>({
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { memberId },
	});

	/** APOLLO REQUESTS **/
	const { loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { ...searchFilter, search: { memberId } } },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const likeProductHandler = useProductLike(setProducts);

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'member-products'}>
			<Stack className={'product-grid'}>
				{products.length ? (
					products.map((product) => (
						<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No products found!')}</p>
					</div>
				)}
			</Stack>
			{total > searchFilter.limit && (
				<Stack className={'pagination-config'}>
					<Pagination
						page={searchFilter.page}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={handlePaginationChange}
						shape={'circular'}
					/>
				</Stack>
			)}
		</Stack>
	);
};

export default MemberProducts;
