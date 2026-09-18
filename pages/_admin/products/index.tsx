import React, { ChangeEvent, KeyboardEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { InputBase, Stack, Tab, Tabs, TablePagination } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import ProductList from '../../../libs/components/admin/products/ProductList';
import { Product } from '../../../libs/types/product/product';
import { AllProductsInquiry } from '../../../libs/types/product/product.input';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { ProductStatus } from '../../../libs/enums/product.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: AllProductsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const AdminProducts: NextPage = () => {
	const [productsInquiry, setProductsInquiry] = useState<AllProductsInquiry>(defaultInput);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [value, setValue] = useState<string>('ALL');
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: productsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setTotal(data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (newValue: string) => {
		setValue(newValue);
		setProductsInquiry({
			...productsInquiry,
			page: 1,
			search: {
				...productsInquiry.search,
				productStatus: newValue === 'ALL' ? undefined : (newValue as ProductStatus),
			},
		});
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		setProductsInquiry({
			...productsInquiry,
			page: 1,
			search: { ...productsInquiry.search, text: searchText.trim() || undefined },
		});
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setProductsInquiry({ ...productsInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setProductsInquiry({ ...productsInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const updateProductHandler = async (input: ProductUpdate) => {
		try {
			if (input.productStatus === ProductStatus.DELETE && !(await sweetConfirmAlert('Delete this product?'))) return;
			await updateProductByAdmin({ variables: { input } });
			await refetch({ input: productsInquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateProductHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const removeProductHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove permanently?'))) return;
			await removeProductByAdmin({ variables: { input: id } });
			await refetch({ input: productsInquiry });
			await sweetTopSmallSuccessAlert('Removed', 800);
		} catch (err: any) {
			console.log('ERROR, removeProductHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Stack className={'admin-page'}>
			<h2 className={'admin-title'}>Products</h2>
			<Stack className={'admin-toolbar'}>
				<Tabs value={value} onChange={(e, newValue) => tabChangeHandler(newValue)}>
					<Tab value={'ALL'} label={'All'} />
					<Tab value={ProductStatus.ACTIVE} label={'Active'} />
					<Tab value={ProductStatus.SOLD_OUT} label={'Sold out'} />
					<Tab value={ProductStatus.DELETE} label={'Deleted'} />
				</Tabs>
				<Stack className={'search-field'}>
					<SearchRoundedIcon />
					<InputBase
						placeholder={'Search title'}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={searchTextHandler}
					/>
				</Stack>
			</Stack>
			<ProductList
				products={products}
				updateProductHandler={updateProductHandler}
				removeProductHandler={removeProductHandler}
			/>
			<TablePagination
				component={'div'}
				count={total}
				page={productsInquiry.page - 1}
				rowsPerPage={productsInquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default withAdminLayout(AdminProducts);
