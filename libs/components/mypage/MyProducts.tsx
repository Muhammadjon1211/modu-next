import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Button, IconButton, InputBase, Menu, MenuItem, Pagination, Stack, Tab, Tabs } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Product } from '../../types/product/product';
import { SellerProductsInquiry } from '../../types/product/product.input';
import { GET_SELLER_PRODUCTS } from '../../../apollo/user/query';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { ProductStatus } from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';
import { categoryLabels } from '../../config';
import { formatPrice, formatterStr, getImageUrl, imageFallbackHandler, salePrice } from '../../utils';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const productStatusLabels: Record<string, string> = {
	[ProductStatus.ACTIVE]: 'Active',
	[ProductStatus.SOLD_OUT]: 'Sold out',
};

const MyProducts = () => {
	const { t } = useTranslation('common');
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');
	const [anchor, setAnchor] = useState<{ el: HTMLElement; product: Product } | null>(null);
	const [searchFilter, setSearchFilter] = useState<SellerProductsInquiry>({
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const { loading, refetch } = useQuery(GET_SELLER_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getSellerProducts?.list ?? []);
			setTotal(data?.getSellerProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: { ...searchFilter.search, productStatus: value === 'ALL' ? undefined : (value as ProductStatus) },
		});
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: { ...searchFilter.search, text: searchText.trim() || undefined },
		});
	};

	const updateStatusHandler = async (product: Product, productStatus: ProductStatus) => {
		try {
			setAnchor(null);
			const question = productStatus === ProductStatus.DELETE ? t('Delete this product?') : t('Change status?');
			if (!(await sweetConfirmAlert(question))) return;
			await updateProduct({ variables: { input: { _id: product._id, productStatus } } });
			await refetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, updateStatusHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'my-products'}>
			<Stack className={'my-title-row'}>
				<h2 className={'my-title'}>{t('Products')}</h2>
				<Link href={{ pathname: '/mypage', query: { category: 'addProduct' } }}>
					<Button variant={'contained'} startIcon={<AddRoundedIcon />}>
						{t('Add product')}
					</Button>
				</Link>
			</Stack>
			<Stack className={'my-toolbar'}>
				<Tabs value={searchFilter.search.productStatus ?? 'ALL'} onChange={(e, value) => tabChangeHandler(value)}>
					<Tab value={'ALL'} label={t('All')} />
					<Tab value={ProductStatus.ACTIVE} label={t('Active')} />
					<Tab value={ProductStatus.SOLD_OUT} label={t('Sold out')} />
				</Tabs>
				<Stack className={'search-field'}>
					<SearchRoundedIcon />
					<InputBase
						placeholder={t('Search')}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={searchTextHandler}
					/>
				</Stack>
			</Stack>

			<Stack className={'my-product-list'}>
				{products.length ? (
					products.map((product) => (
						<Stack key={product._id} className={'my-product-row'}>
							<Link href={{ pathname: '/product/detail', query: { id: product._id } }} className={'row-img'}>
								<img src={getImageUrl(product.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
							</Link>
							<Stack className={'row-info'}>
								<span className={'brand'}>
									{product.productBrand} · {t(categoryLabels[product.productCategory])}
								</span>
								<Link href={{ pathname: '/product/detail', query: { id: product._id } }} className={'title'}>
									{product.productTitle}
								</Link>
								<strong>{formatPrice(salePrice(product.productPrice, product.productDiscount))}</strong>
							</Stack>
							<Stack className={'row-stats'}>
								<Stack>
									<strong>{formatterStr(product.productStock)}</strong>
									<span>{t('Stock')}</span>
								</Stack>
								<Stack>
									<strong>{formatterStr(product.productSales)}</strong>
									<span>{t('Sold')}</span>
								</Stack>
								<Stack>
									<strong>{formatterStr(product.productViews)}</strong>
									<span>{t('Views')}</span>
								</Stack>
							</Stack>
							<span className={`status ${product.productStatus.toLowerCase()}`}>
								{t(productStatusLabels[product.productStatus])}
							</span>
							<IconButton onClick={(e) => setAnchor({ el: e.currentTarget, product })}>
								<MoreHorizRoundedIcon />
							</IconButton>
						</Stack>
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No products found!')}</p>
					</div>
				)}
			</Stack>

			<Menu anchorEl={anchor?.el} open={!!anchor} onClose={() => setAnchor(null)}>
				{anchor && (
					<Link href={{ pathname: '/mypage', query: { category: 'addProduct', productId: anchor.product._id } }}>
						<MenuItem onClick={() => setAnchor(null)}>{t('Edit')}</MenuItem>
					</Link>
				)}
				{anchor?.product.productStatus === ProductStatus.ACTIVE && (
					<MenuItem onClick={() => updateStatusHandler(anchor.product, ProductStatus.SOLD_OUT)}>
						{t('Mark sold out')}
					</MenuItem>
				)}
				{anchor?.product.productStatus === ProductStatus.SOLD_OUT && (
					<MenuItem onClick={() => updateStatusHandler(anchor.product, ProductStatus.ACTIVE)}>
						{t('Mark active')}
					</MenuItem>
				)}
				{anchor && (
					<MenuItem className={'danger'} onClick={() => updateStatusHandler(anchor.product, ProductStatus.DELETE)}>
						{t('Delete')}
					</MenuItem>
				)}
			</Menu>

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

export default MyProducts;
