import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import StoreHeader from '../../../libs/components/admin/stores/StoreHeader';
import StoreProducts from '../../../libs/components/admin/stores/StoreProducts';
import StoreSales from '../../../libs/components/admin/stores/StoreSales';
import StoreCustomers from '../../../libs/components/admin/stores/StoreCustomers';
import StoreReturns from '../../../libs/components/admin/stores/StoreReturns';
import { Member } from '../../../libs/types/member/member';
import { StoreSummary } from '../../../libs/types/order/order';
import { GET_ALL_RETURNS_BY_ADMIN, GET_MEMBER_BY_ADMIN, GET_STORE_SUMMARY_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberStatus } from '../../../libs/enums/member.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const tabs = [
	{ value: 'products', label: 'Products' },
	{ value: 'sales', label: 'Sales' },
	{ value: 'customers', label: 'Customers' },
	{ value: 'returns', label: 'Returns' },
];

const AdminStoreDetail: NextPage = () => {
	const router = useRouter();
	const [storeId, setStoreId] = useState<string>('');
	const [store, setStore] = useState<Member | null>(null);
	const [summary, setSummary] = useState<StoreSummary | null>(null);
	const [returnCount, setReturnCount] = useState<number>(0);
	const tab: string = (router.query?.tab as string) ?? 'products';

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const { loading, refetch: refetchStore } = useQuery(GET_MEMBER_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: storeId },
		skip: !storeId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setStore(data?.getMemberByAdmin ?? null),
	});

	const { refetch: refetchSummary } = useQuery(GET_STORE_SUMMARY_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: storeId },
		skip: !storeId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setSummary(data?.getStoreSummaryByAdmin ?? null),
	});

	const { refetch: refetchReturns } = useQuery(GET_ALL_RETURNS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, search: { sellerId: storeId } } },
		skip: !storeId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setReturnCount(data?.getAllReturnsByAdmin?.metaCounter?.[0]?.total ?? 0),
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) setStoreId(router.query.id as string);
	}, [router]);

	/** HANDLERS **/
	const changeTabHandler = async (value: string) => {
		await router.replace({ pathname: '/_admin/stores/detail', query: { id: storeId, tab: value } }, undefined, {
			shallow: true,
			scroll: false,
		});
	};

	const updateStatusHandler = async (memberStatus: MemberStatus) => {
		try {
			if (memberStatus !== MemberStatus.ACTIVE && !(await sweetConfirmAlert(`Set store to ${memberStatus}?`))) return;
			await updateMemberByAdmin({ variables: { input: { _id: storeId, memberStatus } } });
			await refetchStore({ input: storeId });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateStatusHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const refreshNumbersHandler = () => {
		refetchStore({ input: storeId }).then();
		refetchSummary({ input: storeId }).then();
		refetchReturns().then();
	};

	if (!store) {
		return (
			<Stack className={'admin-page'}>
				<Stack className={'loading-box small'}>
					{loading || !storeId ? <CircularProgress size={28} color={'inherit'} /> : <p>Store not found</p>}
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'admin-page store-detail'}>
			<Link href={'/_admin/stores'} className={'back-link'}>
				<ArrowBackRoundedIcon fontSize={'small'} /> Stores
			</Link>
			<StoreHeader
				store={store}
				summary={summary}
				returnCount={returnCount}
				updateStatusHandler={updateStatusHandler}
			/>
			<Tabs value={tab} onChange={(e, value) => changeTabHandler(value)} className={'store-tabs'}>
				{tabs.map((ele) => (
					<Tab key={ele.value} value={ele.value} label={ele.label} />
				))}
			</Tabs>
			{tab === 'products' && <StoreProducts storeId={store._id} onChanged={refreshNumbersHandler} />}
			{tab === 'sales' && <StoreSales storeId={store._id} />}
			{tab === 'customers' && <StoreCustomers storeId={store._id} />}
			{tab === 'returns' && <StoreReturns storeId={store._id} onChanged={refreshNumbersHandler} />}
		</Stack>
	);
};

export default withAdminLayout(AdminStoreDetail);
