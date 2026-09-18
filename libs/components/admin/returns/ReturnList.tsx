import React, { useState } from 'react';
import Link from 'next/link';
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
import { Return } from '../../../types/return/return';
import { ReturnStatus } from '../../../enums/return.enum';
import { returnReasonLabels } from '../../../config';
import { formatDate, formatPrice, getImageUrl, imageFallbackHandler } from '../../../utils';
import { getComparator, HeadCell, Order } from '../tableSort';

interface Data {
	productId: string;
	memberId: string;
	returnReason: string;
	returnQuantity: number;
	returnAmount: number;
	createdAt: string;
	returnStatus: string;
}

const headCells: readonly HeadCell<Data>[] = [
	{ id: 'productId', label: 'Product', numeric: false },
	{ id: 'memberId', label: 'Buyer', numeric: false },
	{ id: 'returnReason', label: 'Reason', numeric: false, sortable: true },
	{ id: 'returnQuantity', label: 'Qty', numeric: true, sortable: true },
	{ id: 'returnAmount', label: 'Amount', numeric: true, sortable: true },
	{ id: 'createdAt', label: 'Date', numeric: false, sortable: true },
	{ id: 'returnStatus', label: 'Status', numeric: false, sortable: true },
];

/** mirrors the backend state machine so the select only offers legal moves */
const nextStatuses: Record<ReturnStatus, ReturnStatus[]> = {
	[ReturnStatus.REQUEST]: [ReturnStatus.APPROVE, ReturnStatus.REJECT, ReturnStatus.CANCEL],
	[ReturnStatus.APPROVE]: [ReturnStatus.COMPLETE, ReturnStatus.REJECT],
	[ReturnStatus.REJECT]: [],
	[ReturnStatus.COMPLETE]: [],
	[ReturnStatus.CANCEL]: [],
};

interface ReturnListType {
	returns: Return[];
	updateReturnHandler: (input: { _id: string; returnStatus: ReturnStatus }) => void;
}

const ReturnList = (props: ReturnListType) => {
	const { returns, updateReturnHandler } = props;
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof Data>('createdAt');

	/** HANDLERS **/
	const sortHandler = (id: keyof Data) => {
		setOrder(orderBy === id && order === 'desc' ? 'asc' : 'desc');
		setOrderBy(id);
	};

	const rows = [...returns].sort((a, b) => getComparator<any>(order, orderBy)(a, b));

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
						rows.map((ele) => (
							<TableRow key={ele._id} hover>
								<TableCell>
									<Link
										href={{ pathname: '/product/detail', query: { id: ele.productId } }}
										target={'_blank'}
										rel={'noreferrer'}
										className={'cell-product'}
									>
										<img
											src={getImageUrl(ele.productData?.productImages?.[0])}
											alt={''}
											onError={imageFallbackHandler()}
										/>
										<Stack>
											<strong>{ele.productData?.productTitle}</strong>
										</Stack>
									</Link>
								</TableCell>
								<TableCell>
									<Link
										href={{ pathname: '/member', query: { memberId: ele.memberId } }}
										target={'_blank'}
										rel={'noreferrer'}
									>
										{ele.memberData?.memberNick}
									</Link>
								</TableCell>
								<TableCell>
									<Stack className={'cell-reason'}>
										<strong>{returnReasonLabels[ele.returnReason]}</strong>
										{ele.returnDesc && <span>{ele.returnDesc}</span>}
									</Stack>
								</TableCell>
								<TableCell align={'right'}>{ele.returnQuantity}</TableCell>
								<TableCell align={'right'}>{formatPrice(ele.returnAmount)}</TableCell>
								<TableCell>{formatDate(ele.createdAt)}</TableCell>
								<TableCell>
									<Select
										size={'small'}
										value={ele.returnStatus}
										className={`status-select ${ele.returnStatus.toLowerCase()}`}
										disabled={!nextStatuses[ele.returnStatus].length}
										onChange={(e) =>
											updateReturnHandler({ _id: ele._id, returnStatus: e.target.value as ReturnStatus })
										}
									>
										{Object.values(ReturnStatus).map((status) => (
											<MenuItem
												key={status}
												value={status}
												disabled={status !== ele.returnStatus && !nextStatuses[ele.returnStatus].includes(status)}
											>
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
								No returns
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default ReturnList;
