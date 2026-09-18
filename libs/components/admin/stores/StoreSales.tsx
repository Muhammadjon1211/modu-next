import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
	Avatar,
	Stack,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Tabs,
} from '@mui/material';
import { Order } from '../../../types/order/order';
import { AllOrdersInquiry } from '../../../types/order/order.input';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../../../apollo/admin/query';
import { OrderStatus } from '../../../enums/order.enum';
import { Direction } from '../../../enums/common.enum';
import { formatDate, formatPrice, getImageUrl, getMemberImage, imageFallbackHandler, salePrice } from '../../../utils';
import { T } from '../../../types/common';

interface StoreSalesType {
	storeId: string;
}

/** orders that include this store — only the store's own lines and amount are shown */
const StoreSales = (props: StoreSalesType) => {
	const { storeId } = props;
	const [inquiry, setInquiry] = useState<AllOrdersInquiry>({
		page: 1,
		limit: 10,
		sort: 'updatedAt',
		direction: Direction.DESC,
		search: { sellerId: storeId },
	});
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setOrders(data?.getAllOrdersByAdmin?.list ?? []);
			setTotal(data?.getAllOrdersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		setInquiry({
			...inquiry,
			page: 1,
			search: { sellerId: storeId, orderStatus: value === 'ALL' ? undefined : (value as OrderStatus) },
		});
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
				value={inquiry.search.orderStatus ?? 'ALL'}
				onChange={(e, value) => tabChangeHandler(value)}
				className={'sub-tabs'}
			>
				<Tab value={'ALL'} label={'All'} />
				<Tab value={OrderStatus.PROCESS} label={'Processing'} />
				<Tab value={OrderStatus.FINISH} label={'Completed'} />
				<Tab value={OrderStatus.CANCEL} label={'Cancelled'} />
			</Tabs>
			<TableContainer className={'admin-table'}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Order</TableCell>
							<TableCell>Buyer</TableCell>
							<TableCell>Store items</TableCell>
							<TableCell align={'right'}>Qty</TableCell>
							<TableCell align={'right'}>Store amount</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.length ? (
							orders.map((order) => {
								const lines = (order.orderItems ?? []).filter((ele) => ele.sellerId === storeId);
								const first = order.productData?.find((p) => p._id === lines[0]?.productId);
								const qty = lines.reduce((sum, ele) => sum + ele.itemQuantity, 0);
								const amount = lines.reduce(
									(sum, ele) => sum + salePrice(ele.itemPrice, ele.itemDiscount) * ele.itemQuantity,
									0,
								);
								return (
									<TableRow key={order._id} hover>
										<TableCell className={'mono'}>#{order._id.slice(-8).toUpperCase()}</TableCell>
										<TableCell>
											<Stack className={'cell-member'}>
												<Avatar src={getMemberImage(order.memberData?.memberImage)} />
												<strong>{order.memberData?.memberNick ?? '—'}</strong>
											</Stack>
										</TableCell>
										<TableCell>
											<Stack className={'cell-product'}>
												<img src={getImageUrl(first?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
												<Stack>
													<strong>{first?.productTitle ?? '—'}</strong>
													{lines.length > 1 && <span>+{lines.length - 1} more</span>}
												</Stack>
											</Stack>
										</TableCell>
										<TableCell align={'right'}>{qty}</TableCell>
										<TableCell align={'right'}>{formatPrice(amount)}</TableCell>
										<TableCell>{formatDate(order.purchasedAt ?? order.updatedAt, 'YYYY.MM.DD HH:mm')}</TableCell>
										<TableCell>
											<span className={`status ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
										</TableCell>
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={7} align={'center'} className={'empty-cell'}>
									No sales
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
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

export default StoreSales;
