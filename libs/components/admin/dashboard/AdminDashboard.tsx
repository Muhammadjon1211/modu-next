import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Stack } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
	GET_ALL_MEMBERS_BY_ADMIN,
	GET_ALL_ORDERS_BY_ADMIN,
	GET_ALL_PRODUCTS_BY_ADMIN,
	GET_ALL_RETURNS_BY_ADMIN,
} from '../../../../apollo/admin/query';
import { Order } from '../../../types/order/order';
import { Return } from '../../../types/return/return';
import { MemberType } from '../../../enums/member.enum';
import { ProductStatus } from '../../../enums/product.enum';
import { OrderStatus } from '../../../enums/order.enum';
import { ReturnStatus } from '../../../enums/return.enum';
import { Direction } from '../../../enums/common.enum';
import { returnReasonLabels } from '../../../config';
import { formatDate, formatPrice, formatterStr, getImageUrl, imageFallbackHandler } from '../../../utils';
import { T } from '../../../types/common';

const countInput = (search: T) => ({ page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search });
const totalOf = (data: T, key: string): number => data?.[key]?.metaCounter?.[0]?.total ?? 0;

interface StatCardType {
	href: string;
	icon: ReactNode;
	label: string;
	value: number;
	sub?: string;
	accent?: boolean;
}

const StatCard = (props: StatCardType) => {
	const { href, icon, label, value, sub, accent } = props;
	return (
		<Link href={href} className={`stat-card ${accent && value > 0 ? 'accent' : ''}`}>
			<span className={'stat-icon'}>{icon}</span>
			<strong>{formatterStr(value)}</strong>
			<span className={'stat-label'}>{label}</span>
			{sub && <span className={'stat-sub'}>{sub}</span>}
		</Link>
	);
};

const AdminDashboard = () => {
	const [stats, setStats] = useState<T>({});
	const [orders, setOrders] = useState<Order[]>([]);
	const [returns, setReturns] = useState<Return[]>([]);

	const keep = (key: string, value: number) => setStats((prev) => ({ ...prev, [key]: value }));

	/** APOLLO REQUESTS **/
	useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: countInput({}) },
		onCompleted: (data: T) => keep('members', totalOf(data, 'getAllMembersByAdmin')),
	});
	useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: countInput({ memberType: MemberType.SELLER }) },
		onCompleted: (data: T) => keep('sellers', totalOf(data, 'getAllMembersByAdmin')),
	});
	useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: countInput({ productStatus: ProductStatus.ACTIVE }) },
		onCompleted: (data: T) => keep('active', totalOf(data, 'getAllProductsByAdmin')),
	});
	useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: countInput({ productStatus: ProductStatus.SOLD_OUT }) },
		onCompleted: (data: T) => keep('soldOut', totalOf(data, 'getAllProductsByAdmin')),
	});
	useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 5,
				sort: 'updatedAt',
				direction: Direction.DESC,
				search: { orderStatus: OrderStatus.PROCESS },
			},
		},
		onCompleted: (data: T) => {
			keep('processing', totalOf(data, 'getAllOrdersByAdmin'));
			setOrders(data?.getAllOrdersByAdmin?.list ?? []);
		},
	});
	useQuery(GET_ALL_RETURNS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 5,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { returnStatus: ReturnStatus.REQUEST },
			},
		},
		onCompleted: (data: T) => {
			keep('requests', totalOf(data, 'getAllReturnsByAdmin'));
			setReturns(data?.getAllReturnsByAdmin?.list ?? []);
		},
	});

	return (
		<Stack className={'admin-dashboard'}>
			<Stack className={'stat-grid'}>
				<StatCard
					href={'/_admin/users'}
					icon={<PeopleAltOutlinedIcon />}
					label={'Users'}
					value={stats.members ?? 0}
					sub={`${formatterStr(stats.sellers)} sellers`}
				/>
				<StatCard
					href={'/_admin/products'}
					icon={<CheckroomOutlinedIcon />}
					label={'Active products'}
					value={stats.active ?? 0}
					sub={`${formatterStr(stats.soldOut)} sold out`}
				/>
				<StatCard
					href={'/_admin/orders'}
					icon={<ReceiptLongOutlinedIcon />}
					label={'Orders to process'}
					value={stats.processing ?? 0}
					accent
				/>
				<StatCard
					href={'/_admin/returns'}
					icon={<AssignmentReturnOutlinedIcon />}
					label={'Return requests'}
					value={stats.requests ?? 0}
					accent
				/>
			</Stack>

			<Stack className={'panel-grid'}>
				<Stack className={'dash-panel'}>
					<Stack className={'panel-head'}>
						<h3>Processing orders</h3>
						<Link href={'/_admin/orders'}>
							All <ArrowForwardRoundedIcon />
						</Link>
					</Stack>
					{orders.length ? (
						orders.map((order) => {
							const first = order.productData?.find((p) => p._id === order.orderItems?.[0]?.productId);
							const more = (order.orderItems?.length ?? 1) - 1;
							return (
								<Stack key={order._id} className={'panel-row'}>
									<img src={getImageUrl(first?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
									<Stack className={'row-main'}>
										<strong>
											{first?.productTitle ?? '—'}
											{more > 0 && <em> +{more}</em>}
										</strong>
										<span>
											#{order._id.slice(-8).toUpperCase()} ·{' '}
											{formatDate(order.purchasedAt ?? order.updatedAt, 'MM.DD HH:mm')}
										</span>
									</Stack>
									<strong className={'row-amount'}>{formatPrice(order.orderTotal)}</strong>
								</Stack>
							);
						})
					) : (
						<p className={'panel-empty'}>Nothing to process</p>
					)}
				</Stack>

				<Stack className={'dash-panel'}>
					<Stack className={'panel-head'}>
						<h3>Return requests</h3>
						<Link href={'/_admin/returns'}>
							All <ArrowForwardRoundedIcon />
						</Link>
					</Stack>
					{returns.length ? (
						returns.map((item) => (
							<Stack key={item._id} className={'panel-row'}>
								<img
									src={getImageUrl(item.productData?.productImages?.[0])}
									alt={''}
									onError={imageFallbackHandler()}
								/>
								<Stack className={'row-main'}>
									<strong>{item.productData?.productTitle}</strong>
									<span>
										{item.memberData?.memberNick} · {returnReasonLabels[item.returnReason]} · ×{item.returnQuantity}
									</span>
								</Stack>
								<strong className={'row-amount'}>{formatPrice(item.returnAmount)}</strong>
							</Stack>
						))
					) : (
						<p className={'panel-empty'}>No open requests</p>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default AdminDashboard;
