import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { Stack, Tab, Tabs, TablePagination } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import ReturnList from '../../../libs/components/admin/returns/ReturnList';
import { Return } from '../../../libs/types/return/return';
import { AllReturnsInquiry } from '../../../libs/types/return/return.input';
import { ReturnUpdate } from '../../../libs/types/return/return.update';
import { GET_ALL_RETURNS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_RETURN_BY_ADMIN } from '../../../apollo/admin/mutation';
import { ReturnStatus } from '../../../libs/enums/return.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: AllReturnsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const AdminReturns: NextPage = () => {
	const [returnsInquiry, setReturnsInquiry] = useState<AllReturnsInquiry>(defaultInput);
	const [returns, setReturns] = useState<Return[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateReturnByAdmin] = useMutation(UPDATE_RETURN_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_RETURNS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: returnsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setReturns(data?.getAllReturnsByAdmin?.list ?? []);
			setTotal(data?.getAllReturnsByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (newValue: string) => {
		setReturnsInquiry({
			...returnsInquiry,
			page: 1,
			search: newValue === 'ALL' ? {} : { returnStatus: newValue as ReturnStatus },
		});
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setReturnsInquiry({ ...returnsInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setReturnsInquiry({ ...returnsInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const updateReturnHandler = async (input: ReturnUpdate) => {
		try {
			if (!(await sweetConfirmAlert(`Change status to ${input.returnStatus}?`))) return;
			await updateReturnByAdmin({ variables: { input } });
			await refetch({ input: returnsInquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateReturnHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Stack className={'admin-page'}>
			<h2 className={'admin-title'}>Returns</h2>
			<Stack className={'admin-toolbar'}>
				<Tabs
					value={returnsInquiry.search.returnStatus ?? 'ALL'}
					onChange={(e, newValue) => tabChangeHandler(newValue)}
				>
					<Tab value={'ALL'} label={'All'} />
					{Object.values(ReturnStatus).map((status) => (
						<Tab key={status} value={status} label={status.charAt(0) + status.slice(1).toLowerCase()} />
					))}
				</Tabs>
			</Stack>
			<ReturnList returns={returns} updateReturnHandler={updateReturnHandler} />
			<TablePagination
				component={'div'}
				count={total}
				page={returnsInquiry.page - 1}
				rowsPerPage={returnsInquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default withAdminLayout(AdminReturns);
