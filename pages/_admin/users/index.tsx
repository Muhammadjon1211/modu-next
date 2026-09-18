import React, { ChangeEvent, KeyboardEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { InputBase, Stack, Tab, Tabs, TablePagination } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import MemberList from '../../../libs/components/admin/users/MemberList';
import { Member } from '../../../libs/types/member/member';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
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
	search: {},
};

const AdminUsers: NextPage = () => {
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(defaultInput);
	const [members, setMembers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [value, setValue] = useState<string>('ALL');
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAllMembersByAdmin?.list ?? []);
			setTotal(data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (newValue: string) => {
		setValue(newValue);
		const search: T = { text: membersInquiry.search.text };
		if (Object.values(MemberType).includes(newValue as MemberType)) search.memberType = newValue;
		if (newValue === MemberStatus.BLOCK || newValue === MemberStatus.DELETE) search.memberStatus = newValue;
		setMembersInquiry({ ...membersInquiry, page: 1, search });
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		setMembersInquiry({
			...membersInquiry,
			page: 1,
			search: { ...membersInquiry.search, text: searchText.trim() || undefined },
		});
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setMembersInquiry({ ...membersInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setMembersInquiry({ ...membersInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const updateMemberHandler = async (input: MemberUpdate) => {
		try {
			await updateMemberByAdmin({ variables: { input } });
			await refetch({ input: membersInquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateMemberHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Stack className={'admin-page'}>
			<h2 className={'admin-title'}>Users</h2>
			<Stack className={'admin-toolbar'}>
				<Tabs value={value} onChange={(e, newValue) => tabChangeHandler(newValue)}>
					<Tab value={'ALL'} label={'All'} />
					<Tab value={MemberType.USER} label={'Buyers'} />
					<Tab value={MemberType.SELLER} label={'Shops'} />
					<Tab value={MemberType.ADMIN} label={'Admins'} />
					<Tab value={MemberStatus.BLOCK} label={'Blocked'} />
					<Tab value={MemberStatus.DELETE} label={'Deleted'} />
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
			<MemberList members={members} updateMemberHandler={updateMemberHandler} />
			<TablePagination
				component={'div'}
				count={total}
				page={membersInquiry.page - 1}
				rowsPerPage={membersInquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default withAdminLayout(AdminUsers);
