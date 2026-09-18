import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Pagination, Stack, Tab, Tabs } from '@mui/material';
import ReturnCard, { returnStatusLabels } from './ReturnCard';
import { Return } from '../../types/return/return';
import { ReturnsInquiry } from '../../types/return/return.input';
import { GET_MY_RETURNS, GET_SELLER_RETURNS } from '../../../apollo/user/query';
import { CANCEL_RETURN, UPDATE_RETURN } from '../../../apollo/user/mutation';
import { ReturnStatus } from '../../enums/return.enum';
import { Direction } from '../../enums/common.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

interface MyReturnsType {
	asSeller?: boolean;
}

const MyReturns = (props: MyReturnsType) => {
	const { asSeller = false } = props;
	const { t } = useTranslation('common');
	const [returns, setReturns] = useState<Return[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<ReturnsInquiry>({
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: asSeller ? { returnStatus: ReturnStatus.REQUEST } : {},
	});

	/** APOLLO REQUESTS **/
	const [cancelReturn] = useMutation(CANCEL_RETURN);
	const [updateReturn] = useMutation(UPDATE_RETURN);

	const { loading, refetch } = useQuery(asSeller ? GET_SELLER_RETURNS : GET_MY_RETURNS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result = asSeller ? data?.getSellerReturns : data?.getMyReturns;
			setReturns(result?.list ?? []);
			setTotal(result?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: value === 'ALL' ? {} : { returnStatus: value as ReturnStatus },
		});
	};

	const cancelReturnHandler = async (item: Return) => {
		try {
			if (!(await sweetConfirmAlert(t('Cancel this return?')))) return;
			await cancelReturn({ variables: { input: item._id } });
			await refetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, cancelReturnHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const updateReturnHandler = async (item: Return, returnStatus: ReturnStatus) => {
		try {
			if (!(await sweetConfirmAlert(`${t(returnStatusLabels[returnStatus])}?`))) return;
			await updateReturn({ variables: { input: { _id: item._id, returnStatus } } });
			await refetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, updateReturnHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'my-returns'}>
			<h2 className={'my-title'}>{asSeller ? t('Return requests') : t('Returns')}</h2>
			<Tabs
				value={searchFilter.search.returnStatus ?? 'ALL'}
				onChange={(e, value) => tabChangeHandler(value)}
				variant={'scrollable'}
				scrollButtons={false}
			>
				<Tab value={'ALL'} label={t('All')} />
				{Object.values(ReturnStatus).map((status) => (
					<Tab key={status} value={status} label={t(returnStatusLabels[status])} />
				))}
			</Tabs>
			<Stack className={'return-list'}>
				{returns.length ? (
					returns.map((item) => (
						<ReturnCard
							key={item._id}
							item={item}
							showBuyer={asSeller}
							cancelReturnHandler={asSeller ? undefined : cancelReturnHandler}
							updateReturnHandler={asSeller ? updateReturnHandler : undefined}
						/>
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No returns')}</p>
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

export default MyReturns;
