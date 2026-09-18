import React, { ChangeEvent, KeyboardEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { InputBase, Stack, Tab, Tabs, TablePagination } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import StoreList from '../../../libs/components/admin/stores/StoreList';
import { Member } from '../../../libs/types/member/member';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: MembersInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { memberType: MemberType.SELLER },
};

const AdminStores: NextPage = () => {
	const [storesInquiry, setStoresInquiry] = useState<MembersInquiry>(defaultInput);
	const [stores, setStores] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: storesInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setStores(data?.getAllMembersByAdmin?.list ?? []);
			setTotal(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (value: string) => {
		setStoresInquiry({
			...storesInquiry,
			page: 1,
			search: {
				...storesInquiry.search,
				memberStatus: value === 'ALL' ? undefined : (value as MemberStatus),
			},
		});
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		setStoresInquiry({
			...storesInquiry,
			page: 1,
			search: { ...storesInquiry.search, text: searchText.trim() || undefined },
		});
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setStoresInquiry({ ...storesInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setStoresInquiry({ ...storesInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const updateStoreHandler = async (input: MemberUpdate) => {
		try {
			if (
				input.memberStatus !== MemberStatus.ACTIVE &&
				!(await sweetConfirmAlert(`Set shop to ${input.memberStatus}?`))
			)
				return;
			await updateMemberByAdmin({ variables: { input } });
			await refetch({ input: storesInquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateStoreHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Stack className={'admin-page'}>
			<h2 className={'admin-title'}>Shops</h2>
			<Stack className={'admin-toolbar'}>
				<Tabs value={storesInquiry.search.memberStatus ?? 'ALL'} onChange={(e, value) => tabChangeHandler(value)}>
					<Tab value={'ALL'} label={'All'} />
					<Tab value={MemberStatus.ACTIVE} label={'Active'} />
					<Tab value={MemberStatus.BLOCK} label={'Blocked'} />
					<Tab value={MemberStatus.DELETE} label={'Closed'} />
				</Tabs>
				<Stack className={'search-field'}>
					<SearchRoundedIcon />
					<InputBase
						placeholder={'Search nick'}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={searchTextHandler}
					/>
				</Stack>
			</Stack>
			<StoreList stores={stores} updateStoreHandler={updateStoreHandler} />
			<TablePagination
				component={'div'}
				count={total}
				page={storesInquiry.page - 1}
				rowsPerPage={storesInquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default withAdminLayout(AdminStores);
