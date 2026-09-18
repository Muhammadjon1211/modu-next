import React, { useState } from 'react';
import {
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
} from '@mui/material';
import { Order as OrderEntity } from '../../../types/order/order';
import { OrderStatus } from '../../../enums/order.enum';
import { formatDate, formatPrice, getImageUrl, imageFallbackHandler } from '../../../utils';
import { getComparator, HeadCell, Order } from '../tableSort';

interface Data {
	_id: string;
	memberId: string;
	orderItems: number;
	orderTotal: number;
	purchasedAt: string;
	orderStatus: string;
}

const headCells: readonly HeadCell<Data>[] = [
	{ id: '_id', label: 'Order', numeric: false },
	{ id: 'memberId', label: 'Buyer', numeric: false },
	{ id: 'orderItems', label: 'Items', numeric: false },
	{ id: 'orderTotal', label: 'Total', numeric: true, sortable: true },
	{ id: 'purchasedAt', label: 'Date', numeric: false, sortable: true },
	{ id: 'orderStatus', label: 'Status', numeric: false, sortable: true },
];

interface OrderListType {
	orders: OrderEntity[];
	updateOrderHandler: (input: { _id: string; orderStatus: OrderStatus }) => void;
}

const OrderList = (props: OrderListType) => {
	const { orders, updateOrderHandler } = props;
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof Data>('purchasedAt');

	/** HANDLERS **/
	const sortHandler = (id: keyof Data) => {
		setOrder(orderBy === id && order === 'desc' ? 'asc' : 'desc');
		setOrderBy(id);
	};

	const rows = [...orders].sort((a, b) => getComparator<any>(order, orderBy)(a, b));

	return (
		<TableContainer className={'admin-table'}>
			<Table>
				<TableHead>
					<TableRow>
						{headCells.map((cell) => (
							<TableCell key={cell.id} align={cell.numeric ? 'right' : 'left'}>
								{cell.sortable ? (
									<TableSortLabel
										active={orderBy === cell.id}
										direction={orderBy === cell.id ? order : 'desc'}
										onClick={() => sortHandler(cell.id)}
									>
										{cell.label}
									</TableSortLabel>
								) : (
									cell.label
								)}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.length ? (
						rows.map((ele) => {
							const first = ele.productData?.find((p) => p._id === ele.orderItems?.[0]?.productId);
							const count = ele.orderItems?.length ?? 0;
							return (
								<TableRow key={ele._id} hover>
									<TableCell className={'mono'}>#{ele._id.slice(-8).toUpperCase()}</TableCell>
									<TableCell className={'mono'}>{ele.memberId.slice(-8)}</TableCell>
									<TableCell>
										<Stack className={'cell-product'}>
											<img src={getImageUrl(first?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
											<Stack>
												<strong>{first?.productTitle ?? '—'}</strong>
												{count > 1 && <span>+{count - 1}</span>}
											</Stack>
										</Stack>
									</TableCell>
									<TableCell align={'right'}>{formatPrice(ele.orderTotal)}</TableCell>
									<TableCell>{formatDate(ele.purchasedAt ?? ele.updatedAt, 'YYYY.MM.DD HH:mm')}</TableCell>
									<TableCell>
										<Select
											size={'small'}
											value={ele.orderStatus}
											className={`status-select ${ele.orderStatus.toLowerCase()}`}
											disabled={ele.orderStatus === OrderStatus.PAUSE}
											onChange={(e) => updateOrderHandler({ _id: ele._id, orderStatus: e.target.value as OrderStatus })}
										>
											{Object.values(OrderStatus).map((status) => (
												<MenuItem key={status} value={status} disabled={status === OrderStatus.PAUSE}>
													{status}
												</MenuItem>
											))}
										</Select>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={headCells.length} align={'center'} className={'empty-cell'}>
								No orders
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default OrderList;
