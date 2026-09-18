import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { InputBase, MenuItem, Pagination, Select, Skeleton, Stack } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/common/ProductCard';
import { Product } from '../../libs/types/product/product';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { likeTargetProductHandler } from '../../libs/utils';
import { productSortOptions } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: ProductsInquiry = {
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

interface ProductListType {
	initialInput?: ProductsInquiry;
}

const ProductList: NextPage<ProductListType> = ({ initialInput = defaultInput }) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading, refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const input: ProductsInquiry = router.query?.input ? JSON.parse(router.query.input as string) : initialInput;
		setSearchFilter({ ...initialInput, ...input, search: input.search ?? {} });
		setSearchText(input.search?.text ?? '');
	}, [router]);

	/** HANDLERS **/
	const pushInputHandler = async (input: ProductsInquiry) => {
		await router.push(`/product?input=${JSON.stringify(input)}`, `/product?input=${JSON.stringify(input)}`, {
			scroll: false,
		});
	};

	const sortingHandler = (e: any) => {
		const option = productSortOptions[Number(e.target.value)];
		pushInputHandler({
			...searchFilter,
			page: 1,
			sort: option.sort,
			direction: option.direction as Direction,
		}).then();
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		const text = searchText.trim();
		pushInputHandler({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: text || undefined } }).then();
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		await pushInputHandler({ ...searchFilter, page: value });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const likeProductHandler = async (id: string) => {
		await likeTargetProductHandler(likeTargetProduct, id, user?._id);
		await refetch({ input: searchFilter });
	};

	const sortIndex = Math.max(
		0,
		productSortOptions.findIndex(
			(ele) => ele.sort === searchFilter.sort && ele.direction === (searchFilter.direction ?? 'DESC'),
		),
	);
	const pageCount = Math.ceil(total / searchFilter.limit);

	const toolbar = (
		<Stack className={'list-toolbar'}>
			<Stack className={'search-field'}>
				<SearchRoundedIcon />
				<InputBase
					placeholder={t('Search')}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={searchTextHandler}
				/>
			</Stack>
			<span className={'total'}>
				{total} {t('items')}
			</span>
			<Select size={'small'} value={sortIndex} onChange={sortingHandler} className={'sort-select'}>
				{productSortOptions.map((option, index) => (
					<MenuItem key={option.label} value={index}>
						{t(option.label)}
					</MenuItem>
				))}
			</Select>
		</Stack>
	);

	const list = (
		<>
			<Stack className={'product-grid'}>
				{loading && !products.length ? (
					Array.from({ length: 6 }).map((_, index) => (
						<Stack key={index} className={'product-card'}>
							<Skeleton variant={'rounded'} className={'skeleton-img'} />
							<Skeleton width={'40%'} />
							<Skeleton width={'80%'} />
						</Stack>
					))
				) : products.length ? (
					products.map((product) => (
						<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
					))
				) : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No products found!')}</p>
					</div>
				)}
			</Stack>
			{pageCount > 1 && (
				<Stack className={'pagination-config'}>
					<Pagination
						page={searchFilter.page}
						count={pageCount}
						onChange={handlePaginationChange}
						shape={'circular'}
						color={'primary'}
					/>
				</Stack>
			)}
		</>
	);

	// the filter row sticks under the header and only ever scrolls sideways
	const filterBand = (
		<Stack className={'filter-band'}>
			{device === 'mobile' ? (
				<Filter searchFilter={searchFilter} initialInput={initialInput} />
			) : (
				<Stack className={'container'}>
					<Filter searchFilter={searchFilter} initialInput={initialInput} />
				</Stack>
			)}
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<div id="product-list-page">
				{toolbar}
				{filterBand}
				<Stack className={'list-body'}>{list}</Stack>
			</div>
		);
	} else {
		return (
			<div id="product-list-page">
				<Stack className={'container list-head'}>{toolbar}</Stack>
				{filterBand}
				<Stack className={'container list-body'}>{list}</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(ProductList);
