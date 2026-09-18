import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, Pagination, Stack } from '@mui/material';
import { Member } from '../../types/member/member';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { getMemberImage, subscribeHandler, unsubscribeHandler } from '../../utils';
import { T } from '../../types/common';

interface FollowListType {
	memberId: string;
	mode: 'followers' | 'followings';
	onChanged?: () => void;
}

interface FollowRow {
	_id: string;
	member?: Member;
	following: boolean;
}

const FollowList = (props: FollowListType) => {
	const { memberId, mode, onChanged } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [rows, setRows] = useState<FollowRow[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const limit = 10;
	const isFollowers = mode === 'followers';
	const input = isFollowers
		? { page, limit, search: { followingId: memberId } }
		: { page, limit, search: { followerId: memberId } };

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { loading, refetch } = useQuery(isFollowers ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const result = isFollowers ? data?.getMemberFollowers : data?.getMemberFollowings;
			setRows(
				(result?.list ?? []).map((ele: T) => ({
					_id: ele._id,
					member: isFollowers ? ele.followerData : ele.followingData,
					following: !!ele.meFollowed?.length,
				})),
			);
			setTotal(result?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const followHandler = async (row: FollowRow) => {
		if (!row.member?._id) return;
		if (row.following) await unsubscribeHandler(unsubscribe, row.member._id, user?._id);
		else await subscribeHandler(subscribe, row.member._id, user?._id);
		await refetch({ input });
		onChanged?.();
	};

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => setPage(value);

	return (
		<Stack className={'follow-list'}>
			{rows.length ? (
				rows.map((row) => (
					<Stack key={row._id} className={'follow-row'}>
						<Link href={{ pathname: '/member', query: { memberId: row.member?._id } }} className={'who'}>
							<Avatar src={getMemberImage(row.member?.memberImage)} />
							<Stack>
								<strong>{row.member?.memberShopName || row.member?.memberNick}</strong>
								<span>
									@{row.member?.memberNick} · {row.member?.memberFollowers ?? 0} {t('Followers')}
								</span>
							</Stack>
						</Link>
						{user?._id && row.member?._id !== user._id && (
							<Button
								size={'small'}
								variant={row.following ? 'outlined' : 'contained'}
								onClick={() => followHandler(row)}
							>
								{row.following ? t('Following') : t('Follow')}
							</Button>
						)}
					</Stack>
				))
			) : loading ? null : (
				<div className={'no-data small'}>
					<p>{isFollowers ? t('No followers yet') : t('Not following anyone')}</p>
				</div>
			)}
			{total > limit && (
				<Stack className={'pagination-config'}>
					<Pagination
						page={page}
						count={Math.ceil(total / limit)}
						onChange={handlePaginationChange}
						shape={'circular'}
						size={'small'}
					/>
				</Stack>
			)}
		</Stack>
	);
};

export default FollowList;
