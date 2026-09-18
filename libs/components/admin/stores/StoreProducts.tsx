import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Stack, Tab, Tabs, TablePagination } from '@mui/material';
import ProductList from '../products/ProductList';
import { Product } from '../../../types/product/product';
import { AllProductsInquiry } from '../../../types/product/product.input';
import { ProductUpdate } from '../../../types/product/product.update';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../../apollo/admin/query';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { ProductStatus } from '../../../enums/product.enum';
import { Direction } from '../../../enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';

interface StoreProductsType {
	storeId: string;
	onChanged?: () => void;
}

const StoreProducts = (props: StoreProductsType) => {
	const { storeId, onChanged } = props;
	const [inquiry, setInquiry] = useState<AllProductsInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { memberId: storeId },
	});
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setTotal(data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		setInquiry({
			...inquiry,
			page: 1,
			search: { memberId: storeId, productStatus: value === 'ALL' ? undefined : (value as ProductStatus) },
		});
	};

	const updateProductHandler = async (input: ProductUpdate) => {
		try {
			if (input.productStatus === ProductStatus.DELETE && !(await sweetConfirmAlert('Delete this product?'))) return;
			await updateProductByAdmin({ variables: { input } });
			await refetch({ input: inquiry });
			onChanged?.();
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
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Removed', 800);
		} catch (err: any) {
			console.log('ERROR, removeProductHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setInquiry({ ...inquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setInquiry({ ...inquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	return (
		<Stack className={'store-panel'}>
			<Tabs
				value={inquiry.search.productStatus ?? 'ALL'}
				onChange={(e, value) => tabChangeHandler(value)}
				className={'sub-tabs'}
			>
				<Tab value={'ALL'} label={'All'} />
				<Tab value={ProductStatus.ACTIVE} label={'Active'} />
				<Tab value={ProductStatus.SOLD_OUT} label={'Sold out'} />
				<Tab value={ProductStatus.DELETE} label={'Deleted'} />
			</Tabs>
			<ProductList
				products={products}
				updateProductHandler={updateProductHandler}
				removeProductHandler={removeProductHandler}
			/>
			<TablePagination
				component={'div'}
				count={total}
				page={inquiry.page - 1}
				rowsPerPage={inquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default StoreProducts;
