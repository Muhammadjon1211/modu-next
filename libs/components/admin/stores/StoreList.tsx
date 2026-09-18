import React, { useState } from 'react';
import Link from 'next/link';
import {
	Avatar,
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
import { Member } from '../../../types/member/member';
import { MemberStatus } from '../../../enums/member.enum';
import { formatDate, formatterStr, getMemberImage } from '../../../utils';
import { getComparator, HeadCell, Order } from '../tableSort';

interface Data {
	memberNick: string;
	memberPhone: string;
	memberProducts: number;
	memberFollowers: number;
	memberLikes: number;
	createdAt: string;
	memberStatus: string;
}

const headCells: readonly HeadCell<Data>[] = [
	{ id: 'memberNick', label: 'Shop', numeric: false, sortable: true },
	{ id: 'memberPhone', label: 'Phone', numeric: false },
	{ id: 'memberProducts', label: 'Products', numeric: true, sortable: true },
	{ id: 'memberFollowers', label: 'Followers', numeric: true, sortable: true },
	{ id: 'memberLikes', label: 'Likes', numeric: true, sortable: true },
	{ id: 'createdAt', label: 'Opened', numeric: false, sortable: true },
	{ id: 'memberStatus', label: 'Status', numeric: false, sortable: true },
];

interface StoreListType {
	stores: Member[];
	updateStoreHandler: (input: { _id: string; memberStatus: MemberStatus }) => void;
}

const StoreList = (props: StoreListType) => {
	const { stores, updateStoreHandler } = props;
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof Data>('createdAt');

	/** HANDLERS **/
	const sortHandler = (id: keyof Data) => {
		setOrder(orderBy === id && order === 'desc' ? 'asc' : 'desc');
		setOrderBy(id);
	};

	const rows = [...stores].sort((a, b) => getComparator<any>(order, orderBy)(a, b));

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
						rows.map((store) => (
							<TableRow key={store._id} hover>
								<TableCell>
									<Link href={{ pathname: '/_admin/shops/detail', query: { id: store._id } }} className={'cell-member'}>
										<Avatar src={getMemberImage(store.memberImage)} />
										<Stack>
											<strong>{store.memberShopName || store.memberNick}</strong>
											<span>@{store.memberNick}</span>
										</Stack>
									</Link>
								</TableCell>
								<TableCell>{store.memberPhone}</TableCell>
								<TableCell align={'right'}>{formatterStr(store.memberProducts)}</TableCell>
								<TableCell align={'right'}>{formatterStr(store.memberFollowers)}</TableCell>
								<TableCell align={'right'}>{formatterStr(store.memberLikes)}</TableCell>
								<TableCell>{formatDate(store.createdAt)}</TableCell>
								<TableCell>
									<Select
										size={'small'}
										value={store.memberStatus}
										className={`status-select ${store.memberStatus.toLowerCase()}`}
										onChange={(e) =>
											updateStoreHandler({ _id: store._id, memberStatus: e.target.value as MemberStatus })
										}
									>
										{Object.values(MemberStatus).map((status) => (
											<MenuItem key={status} value={status}>
												{status}
											</MenuItem>
										))}
									</Select>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={headCells.length} align={'center'} className={'empty-cell'}>
								No shops
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default StoreList;
