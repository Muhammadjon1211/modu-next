import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import MemberHeader from '../../libs/components/member/MemberHeader';
import MemberProducts from '../../libs/components/member/MemberProducts';
import MemberArticles from '../../libs/components/member/MemberArticles';
import FollowList from '../../libs/components/member/FollowList';
import { Member } from '../../libs/types/member/member';
import { GET_MEMBER } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { MemberType } from '../../libs/enums/member.enum';
import { likeTargetMemberHandler, subscribeHandler, unsubscribeHandler } from '../../libs/utils';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [memberId, setMemberId] = useState<string>('');
	const [member, setMember] = useState<Member | null>(null);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { loading, refetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMember) setMember(data.getMember);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId) setMemberId(router.query.memberId as string);
	}, [router]);

	/** HANDLERS **/
	const isSeller = member?.memberType === MemberType.SELLER;
	const category: string = (router.query?.category as string) ?? (isSeller ? 'products' : 'articles');

	const changeTabHandler = async (value: string) => {
		await router.push(
			{ pathname: '/member', query: { memberId, category: value } },
			{ pathname: '/member', query: { memberId, category: value } },
			{ scroll: false, shallow: true },
		);
	};

	const followHandler = async () => {
		if (!member) return;
		if (member.meFollowed?.length) await unsubscribeHandler(unsubscribe, member._id, user?._id);
		else await subscribeHandler(subscribe, member._id, user?._id);
		await refetch({ input: memberId });
	};

	const likeHandler = async () => {
		if (!member) return;
		await likeTargetMemberHandler(likeTargetMember, member._id, user?._id);
		await refetch({ input: memberId });
	};

	if (!member) {
		return (
			<div id="member-page">
				<Stack className={'loading-box'}>
					{loading || !memberId ? (
						<CircularProgress color={'inherit'} />
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No data found!')}</p>
						</div>
					)}
				</Stack>
			</div>
		);
	}

	const content = (
		<>
			<MemberHeader member={member} followHandler={followHandler} likeHandler={likeHandler} />
			<Tabs
				value={category}
				onChange={(e, value) => changeTabHandler(value)}
				className={'member-tabs'}
				variant={device === 'mobile' ? 'scrollable' : 'standard'}
			>
				{isSeller && <Tab value={'products'} label={t('Products')} />}
				<Tab value={'articles'} label={t('Posts')} />
				<Tab value={'followers'} label={t('Followers')} />
				<Tab value={'followings'} label={t('Following')} />
			</Tabs>
			<Stack className={'member-tab-body'}>
				{category === 'products' && isSeller && <MemberProducts memberId={member._id} />}
				{category === 'articles' && <MemberArticles memberId={member._id} />}
				{category === 'followers' && (
					<FollowList memberId={member._id} mode={'followers'} onChanged={() => refetch({ input: memberId })} />
				)}
				{category === 'followings' && (
					<FollowList memberId={member._id} mode={'followings'} onChanged={() => refetch({ input: memberId })} />
				)}
			</Stack>
		</>
	);

	if (device === 'mobile') {
		return <div id="member-page">{content}</div>;
	} else {
		return (
			<div id="member-page">
				<Stack className={'container'}>{content}</Stack>
			</div>
		);
	}
};

export default withLayoutFull(MemberPage);
