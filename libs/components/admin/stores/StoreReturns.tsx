import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Stack, TablePagination } from '@mui/material';
import ReturnList from '../returns/ReturnList';
import { Return } from '../../../types/return/return';
import { AllReturnsInquiry } from '../../../types/return/return.input';
import { ReturnUpdate } from '../../../types/return/return.update';
import { GET_ALL_RETURNS_BY_ADMIN } from '../../../../apollo/admin/query';
import { UPDATE_RETURN_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { Direction } from '../../../enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';

interface StoreReturnsType {
	storeId: string;
	onChanged?: () => void;
}

const StoreReturns = (props: StoreReturnsType) => {
	const { storeId, onChanged } = props;
	const [inquiry, setInquiry] = useState<AllReturnsInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { sellerId: storeId },
	});
	const [returns, setReturns] = useState<Return[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateReturnByAdmin] = useMutation(UPDATE_RETURN_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_RETURNS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setReturns(data?.getAllReturnsByAdmin?.list ?? []);
			setTotal(data?.getAllReturnsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const updateReturnHandler = async (input: ReturnUpdate) => {
		try {
			if (!(await sweetConfirmAlert(`Change status to ${input.returnStatus}?`))) return;
			await updateReturnByAdmin({ variables: { input } });
			await refetch({ input: inquiry });
			onChanged?.();
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateReturnHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setInquiry({ ...inquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setInquiry({ ...inquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	return (
		<Stack className={'store-panel'}>
			<ReturnList returns={returns} updateReturnHandler={updateReturnHandler} />
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

export default StoreReturns;
