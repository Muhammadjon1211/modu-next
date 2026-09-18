import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { InputBase, MenuItem, Pagination, Select, Stack } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import SellerCard from '../../libs/components/common/SellerCard';
import { Member } from '../../libs/types/member/member';
import { SellersInquiry } from '../../libs/types/member/member.input';
import { GET_SELLERS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { likeTargetMemberHandler } from '../../libs/utils';
import { sellerSortOptions } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: SellersInquiry = {
	page: 1,
	limit: 12,
	sort: 'memberRank',
	direction: Direction.DESC,
	search: {},
};

interface SellerListType {
	initialInput?: SellersInquiry;
}

const SellerList: NextPage<SellerListType> = ({ initialInput = defaultInput }) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<SellersInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [sellers, setSellers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { loading, refetch } = useQuery(GET_SELLERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSellers(data?.getSellers?.list ?? []);
			setTotal(data?.getSellers?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const input: SellersInquiry = router.query?.input ? JSON.parse(router.query.input as string) : initialInput;
		setSearchFilter({ ...initialInput, ...input, search: input.search ?? {} });
		setSearchText(input.search?.text ?? '');
	}, [router]);

	/** HANDLERS **/
	const pushInputHandler = async (input: SellersInquiry) => {
		await router.push(`/seller?input=${JSON.stringify(input)}`, `/seller?input=${JSON.stringify(input)}`, {
			scroll: false,
		});
	};

	const sortingHandler = (e: any) => {
		const option = sellerSortOptions[Number(e.target.value)];
		pushInputHandler({ ...searchFilter, page: 1, sort: option.sort, direction: option.direction as Direction }).then();
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		pushInputHandler({ ...searchFilter, page: 1, search: { text: searchText.trim() || undefined } }).then();
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		await pushInputHandler({ ...searchFilter, page: value });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const likeMemberHandler = async (id: string) => {
		await likeTargetMemberHandler(likeTargetMember, id, user?._id);
		await refetch({ input: searchFilter });
	};

	const sortIndex = Math.max(
		0,
		sellerSortOptions.findIndex((ele) => ele.sort === searchFilter.sort),
	);

	const content = (
		<>
			<Stack className={'list-toolbar'}>
				<Stack className={'search-field'}>
					<SearchRoundedIcon />
					<InputBase
						placeholder={t('Search')}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={searchTextHandler}
					/>
				</Stack>
				<span className={'total'}>
					{total} {t('shops')}
				</span>
				<Select size={'small'} value={sortIndex} onChange={sortingHandler} className={'sort-select'}>
					{sellerSortOptions.map((option, index) => (
						<MenuItem key={option.label} value={index}>
							{t(option.label)}
						</MenuItem>
					))}
				</Select>
			</Stack>
			<Stack className={'seller-grid'}>
				{sellers.length ? (
					sellers.map((seller) => <SellerCard key={seller._id} seller={seller} likeMemberHandler={likeMemberHandler} />)
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No shops found!')}</p>
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
						color={'primary'}
					/>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		return <div id="seller-list-page">{content}</div>;
	} else {
		return (
			<div id="seller-list-page">
				<Stack className={'container'}>{content}</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(SellerList);
