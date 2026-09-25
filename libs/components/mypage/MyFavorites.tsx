import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Pagination, Stack } from '@mui/material';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { OrdinaryInquiry } from '../../types/member/member.input';
import { GET_FAVORITES, GET_VISITED } from '../../../apollo/user/query';
import { T } from '../../types/common';
import useProductLike from '../../hooks/useProductLike';

interface MyFavoritesType {
	visited?: boolean;
}

/** one component for the wishlist and the recently viewed list — same shape, different query */
const MyFavorites = (props: MyFavoritesType) => {
	const { visited = false } = props;
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<OrdinaryInquiry>({ page: 1, limit: 9 });

	/** APOLLO REQUESTS **/
	const { loading } = useQuery(visited ? GET_VISITED : GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result = visited ? data?.getVisited : data?.getFavorites;
			setProducts(result?.list ?? []);
			setTotal(result?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const likeProductHandler = useProductLike(setProducts, { removeOnUnlike: true });

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'my-favorites'}>
			<h2 className={'my-title'}>{visited ? t('Recently viewed') : t('Favorites')}</h2>
			<Stack className={'product-grid'}>
				{products.length ? (
					products.map((product) => (
						<ProductCard
							key={product._id}
							product={product}
							myFavorites={!visited}
							likeProductHandler={visited ? undefined : likeProductHandler}
						/>
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('Nothing here yet')}</p>
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

export default MyFavorites;
