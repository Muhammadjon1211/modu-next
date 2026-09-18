import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Pagination, Stack, Tab, Tabs } from '@mui/material';
import OrderCard from './OrderCard';
import ReturnDialog from './ReturnDialog';
import { Order, OrderItem } from '../../types/order/order';
import { Product } from '../../types/product/product';
import { OrdersInquiry } from '../../types/order/order.input';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { UPDATE_ORDER } from '../../../apollo/user/mutation';
import { OrderStatus } from '../../enums/order.enum';
import { Direction } from '../../enums/common.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const tabs = [
	{ value: 'ALL', label: 'All' },
	{ value: OrderStatus.PROCESS, label: 'Processing' },
	{ value: OrderStatus.FINISH, label: 'Completed' },
	{ value: OrderStatus.CANCEL, label: 'Cancelled' },
];

const MyOrders = () => {
	const { t } = useTranslation('common');
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [returnTarget, setReturnTarget] = useState<{ item: OrderItem; product?: Product } | null>(null);
	const [searchFilter, setSearchFilter] = useState<OrdersInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const [updateOrder] = useMutation(UPDATE_ORDER);

	const { loading, refetch } = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setOrders(data?.getMyOrders?.list ?? []);
			setTotal(data?.getMyOrders?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: value === 'ALL' ? {} : { orderStatus: value as OrderStatus },
		});
	};

	const updateOrderHandler = async (order: Order, orderStatus: OrderStatus, question: string) => {
		try {
			if (!(await sweetConfirmAlert(question))) return;
			await updateOrder({ variables: { input: { _id: order._id, orderStatus } } });
			await refetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, updateOrderHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'my-orders'}>
			<h2 className={'my-title'}>{t('Orders')}</h2>
			<Tabs
				value={searchFilter.search.orderStatus ?? 'ALL'}
				onChange={(e, value) => tabChangeHandler(value)}
				variant={'scrollable'}
				scrollButtons={false}
			>
				{tabs.map((tab) => (
					<Tab key={tab.value} value={tab.value} label={t(tab.label)} />
				))}
			</Tabs>
			<Stack className={'order-list'}>
				{orders.length ? (
					orders.map((order) => (
						<OrderCard
							key={order._id}
							order={order}
							cancelOrderHandler={(target) => updateOrderHandler(target, OrderStatus.CANCEL, t('Cancel this order?'))}
							finishOrderHandler={(target) =>
								updateOrderHandler(target, OrderStatus.FINISH, t('Did you receive this order?'))
							}
							returnItemHandler={(item, product) => setReturnTarget({ item, product })}
						/>
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No orders yet')}</p>
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
			<ReturnDialog
				item={returnTarget?.item ?? null}
				product={returnTarget?.product}
				onClose={() => setReturnTarget(null)}
				onDone={() => {
					setReturnTarget(null);
					refetch({ input: searchFilter }).then();
				}}
			/>
		</Stack>
	);
};

export default MyOrders;
