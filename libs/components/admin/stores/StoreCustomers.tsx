import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
	Avatar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
} from '@mui/material';
import { StoreCustomer } from '../../../types/order/order';
import { StoreCustomersInquiry } from '../../../types/order/order.input';
import { GET_STORE_CUSTOMERS_BY_ADMIN } from '../../../../apollo/admin/query';
import { formatDate, formatPrice, formatterStr, getMemberImage } from '../../../utils';
import { T } from '../../../types/common';

interface StoreCustomersType {
	storeId: string;
}

/** buyers of this store, ranked by what they spent here */
const StoreCustomers = (props: StoreCustomersType) => {
	const { storeId } = props;
	const [inquiry, setInquiry] = useState<StoreCustomersInquiry>({ page: 1, limit: 10, search: { sellerId: storeId } });
	const [customers, setCustomers] = useState<StoreCustomer[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	useQuery(GET_STORE_CUSTOMERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setCustomers(data?.getStoreCustomersByAdmin?.list ?? []);
			setTotal(data?.getStoreCustomersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setInquiry({ ...inquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setInquiry({ ...inquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	return (
		<Stack className={'store-panel'}>
			<TableContainer className={'admin-table'}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Customer</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell align={'right'}>Orders</TableCell>
							<TableCell align={'right'}>Units</TableCell>
							<TableCell align={'right'}>Spent</TableCell>
							<TableCell>Last order</TableCell>
							<TableCell>Status</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{customers.length ? (
							customers.map((customer) => (
								<TableRow key={customer._id} hover>
									<TableCell>
										<Stack className={'cell-member'}>
											<Avatar src={getMemberImage(customer.memberData?.memberImage)} />
											<Stack>
												<strong>{customer.memberData?.memberNick ?? 'Deleted member'}</strong>
												{customer.memberData?.memberFullName && <span>{customer.memberData.memberFullName}</span>}
											</Stack>
										</Stack>
									</TableCell>
									<TableCell>{customer.memberData?.memberPhone}</TableCell>
									<TableCell align={'right'}>{formatterStr(customer.orderCount)}</TableCell>
									<TableCell align={'right'}>{formatterStr(customer.unitsBought)}</TableCell>
									<TableCell align={'right'}>{formatPrice(customer.totalSpent)}</TableCell>
									<TableCell>{formatDate(customer.lastOrderAt)}</TableCell>
									<TableCell>
										{customer.memberData && (
											<span className={`status ${customer.memberData.memberStatus.toLowerCase()}`}>
												{customer.memberData.memberStatus}
											</span>
										)}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} align={'center'} className={'empty-cell'}>
									No customers yet
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

export default StoreCustomers;
