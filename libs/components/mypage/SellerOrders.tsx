import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Pagination, Stack, Tab, Tabs } from '@mui/material';
import OrderCard from './OrderCard';
import { Order } from '../../types/order/order';
import { OrdersInquiry } from '../../types/order/order.input';
import { GET_SELLER_ORDERS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { OrderStatus } from '../../enums/order.enum';
import { Direction } from '../../enums/common.enum';
import { T } from '../../types/common';

const tabs = [
	{ value: 'ALL', label: 'All' },
	{ value: OrderStatus.PROCESS, label: 'Processing' },
	{ value: OrderStatus.FINISH, label: 'Completed' },
	{ value: OrderStatus.CANCEL, label: 'Cancelled' },
];

const SellerOrders = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<OrdersInquiry>({
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { loading } = useQuery(GET_SELLER_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setOrders(data?.getSellerOrders?.list ?? []);
			setTotal(data?.getSellerOrders?.metaCounter?.[0]?.total ?? 0);
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

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'my-orders'}>
			<h2 className={'my-title'}>{t('Sales')}</h2>
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
					orders.map((order) => <OrderCard key={order._id} order={order} sellerId={user?._id} />)
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
		</Stack>
	);
};

export default SellerOrders;
