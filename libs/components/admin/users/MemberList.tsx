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
import { MemberStatus, MemberType } from '../../../enums/member.enum';
import { formatDate, formatterStr, getMemberImage } from '../../../utils';
import { getComparator, HeadCell, Order } from '../tableSort';

interface Data {
	memberNick: string;
	memberPhone: string;
	memberType: string;
	memberStatus: string;
	memberProducts: number;
	memberOrders: number;
	createdAt: string;
}

const headCells: readonly HeadCell<Data>[] = [
	{ id: 'memberNick', label: 'Member', numeric: false, sortable: true },
	{ id: 'memberPhone', label: 'Phone', numeric: false },
	{ id: 'memberType', label: 'Type', numeric: false, sortable: true },
	{ id: 'memberProducts', label: 'Products', numeric: true, sortable: true },
	{ id: 'memberOrders', label: 'Orders', numeric: true, sortable: true },
	{ id: 'createdAt', label: 'Joined', numeric: false, sortable: true },
	{ id: 'memberStatus', label: 'Status', numeric: false, sortable: true },
];

interface MemberListType {
	members: Member[];
	updateMemberHandler: (input: { _id: string; memberType?: MemberType; memberStatus?: MemberStatus }) => void;
}

const MemberList = (props: MemberListType) => {
	const { members, updateMemberHandler } = props;
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof Data>('createdAt');

	/** HANDLERS **/
	const sortHandler = (id: keyof Data) => {
		setOrder(orderBy === id && order === 'desc' ? 'asc' : 'desc');
		setOrderBy(id);
	};

	const rows = [...members].sort((a, b) => getComparator<any>(order, orderBy)(a, b));

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
						rows.map((member) => (
							<TableRow key={member._id} hover>
								<TableCell>
									{/* a seller opens its store in admin; anyone else opens the public profile */}
									<Link
										href={
											member.memberType === MemberType.SELLER
												? { pathname: '/_admin/stores/detail', query: { id: member._id } }
												: { pathname: '/member', query: { memberId: member._id } }
										}
										target={member.memberType === MemberType.SELLER ? undefined : '_blank'}
										rel={'noreferrer'}
										className={'cell-member'}
									>
										<Avatar src={getMemberImage(member.memberImage)} />
										<Stack>
											<strong>{member.memberNick}</strong>
											{member.memberShopName && <span>{member.memberShopName}</span>}
										</Stack>
									</Link>
								</TableCell>
								<TableCell>{member.memberPhone}</TableCell>
								<TableCell>
									<Select
										size={'small'}
										value={member.memberType}
										onChange={(e) => updateMemberHandler({ _id: member._id, memberType: e.target.value as MemberType })}
									>
										{Object.values(MemberType).map((type) => (
											<MenuItem key={type} value={type}>
												{type}
											</MenuItem>
										))}
									</Select>
								</TableCell>
								<TableCell align={'right'}>{formatterStr(member.memberProducts)}</TableCell>
								<TableCell align={'right'}>{formatterStr(member.memberOrders)}</TableCell>
								<TableCell>{formatDate(member.createdAt)}</TableCell>
								<TableCell>
									<Select
										size={'small'}
										value={member.memberStatus}
										className={`status-select ${member.memberStatus.toLowerCase()}`}
										onChange={(e) =>
											updateMemberHandler({ _id: member._id, memberStatus: e.target.value as MemberStatus })
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
								No members
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default MemberList;
