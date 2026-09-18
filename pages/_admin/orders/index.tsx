import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { Stack, Tab, Tabs, TablePagination } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import OrderList from '../../../libs/components/admin/orders/OrderList';
import { Order } from '../../../libs/types/order/order';
import { AllOrdersInquiry } from '../../../libs/types/order/order.input';
import { OrderUpdate } from '../../../libs/types/order/order.update';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_ORDER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { OrderStatus } from '../../../libs/enums/order.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: AllOrdersInquiry = {
	page: 1,
	limit: 10,
	sort: 'updatedAt',
	direction: Direction.DESC,
	search: { orderStatus: OrderStatus.PROCESS },
};

const AdminOrders: NextPage = () => {
	const [ordersInquiry, setOrdersInquiry] = useState<AllOrdersInquiry>(defaultInput);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateOrderByAdmin] = useMutation(UPDATE_ORDER_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: ordersInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setOrders(data?.getAllOrdersByAdmin?.list ?? []);
			setTotal(data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (newValue: string) => {
		setOrdersInquiry({
			...ordersInquiry,
			page: 1,
			search: newValue === 'ALL' ? {} : { orderStatus: newValue as OrderStatus },
		});
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setOrdersInquiry({ ...ordersInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setOrdersInquiry({ ...ordersInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const updateOrderHandler = async (input: OrderUpdate) => {
		try {
			if (!(await sweetConfirmAlert(`Change status to ${input.orderStatus}?`))) return;
			await updateOrderByAdmin({ variables: { input } });
			await refetch({ input: ordersInquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateOrderHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Stack className={'admin-page'}>
			<h2 className={'admin-title'}>Orders</h2>
			<Stack className={'admin-toolbar'}>
				<Tabs value={ordersInquiry.search.orderStatus ?? 'ALL'} onChange={(e, newValue) => tabChangeHandler(newValue)}>
					<Tab value={'ALL'} label={'All'} />
					<Tab value={OrderStatus.PROCESS} label={'Processing'} />
					<Tab value={OrderStatus.FINISH} label={'Completed'} />
					<Tab value={OrderStatus.CANCEL} label={'Cancelled'} />
					<Tab value={OrderStatus.PAUSE} label={'Carts'} />
				</Tabs>
			</Stack>
			<OrderList orders={orders} updateOrderHandler={updateOrderHandler} />
			<TablePagination
				component={'div'}
				count={total}
				page={ordersInquiry.page - 1}
				rowsPerPage={ordersInquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default withAdminLayout(AdminOrders);
