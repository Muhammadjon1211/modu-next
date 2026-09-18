import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { Stack, Tab, Tabs } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MyReturns from '../../libs/components/mypage/MyReturns';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import MyProducts from '../../libs/components/mypage/MyProducts';
import AddProduct from '../../libs/components/mypage/AddProduct';
import SellerOrders from '../../libs/components/mypage/SellerOrders';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MyAddresses from '../../libs/components/mypage/MyAddresses';
import MyPayments from '../../libs/components/mypage/MyPayments';
import MemberArticles from '../../libs/components/member/MemberArticles';
import FollowList from '../../libs/components/member/FollowList';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { MemberType } from '../../libs/enums/member.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const sellerOnly = ['myProducts', 'addProduct', 'sellerOrders', 'sellerReturns'];

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [ready, setReady] = useState<boolean>(false);
	const category: string = (router.query?.category as string) ?? 'myOrders';

	/** LIFECYCLES **/
	useEffect(() => {
		// child effects run before the layout rehydrates userVar, so the token is the guard here
		if (!getJwtToken()) router.push('/account/join').then();
		else setReady(true);
	}, []);

	useEffect(() => {
		if (user?._id && sellerOnly.includes(category) && user.memberType !== MemberType.SELLER) {
			router.replace('/mypage?category=myOrders').then();
		}
	}, [user, category]);

	/** HANDLERS **/
	const changeCategoryHandler = async (value: string) => {
		await router.push({ pathname: '/mypage', query: { category: value } }, undefined, { scroll: false });
	};

	if (!ready || !user?._id) return <div id="my-page" />;

	const body = (
		<Stack className={'main-config'}>
			{category === 'myProfile' && <MyProfile />}
			{category === 'myAddresses' && <MyAddresses />}
			{category === 'myPayments' && <MyPayments />}
			{category === 'myOrders' && <MyOrders />}
			{category === 'myReturns' && <MyReturns />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'recentlyVisited' && <MyFavorites visited />}
			{category === 'myProducts' && <MyProducts />}
			{category === 'addProduct' && <AddProduct />}
			{category === 'sellerOrders' && <SellerOrders />}
			{category === 'sellerReturns' && <MyReturns asSeller />}
			{category === 'myArticles' && (
				<>
					<h2 className={'my-title'}>{t('My posts')}</h2>
					<MemberArticles memberId={user._id} />
				</>
			)}
			{category === 'writeArticle' && <WriteArticle />}
			{category === 'followers' && (
				<>
					<h2 className={'my-title'}>{t('Followers')}</h2>
					<FollowList memberId={user._id} mode={'followers'} />
				</>
			)}
			{category === 'followings' && (
				<>
					<h2 className={'my-title'}>{t('Following')}</h2>
					<FollowList memberId={user._id} mode={'followings'} />
				</>
			)}
		</Stack>
	);

	if (device === 'mobile') {
		const isSeller = user.memberType === MemberType.SELLER;
		const tabs = [
			{ key: 'myOrders', label: 'Orders' },
			{ key: 'myReturns', label: 'Returns' },
			{ key: 'myFavorites', label: 'Favorites' },
			{ key: 'recentlyVisited', label: 'Recently viewed' },
			...(isSeller
				? [
						{ key: 'myProducts', label: 'Products' },
						{ key: 'addProduct', label: 'Add product' },
						{ key: 'sellerOrders', label: 'Sales' },
						{ key: 'sellerReturns', label: 'Return requests' },
					]
				: []),
			{ key: 'myArticles', label: 'My posts' },
			{ key: 'writeArticle', label: 'Write' },
			{ key: 'followers', label: 'Followers' },
			{ key: 'followings', label: 'Following' },
			{ key: 'myProfile', label: 'Profile' },
			{ key: 'myAddresses', label: 'Addresses' },
			{ key: 'myPayments', label: 'Payment methods' },
		];
		return (
			<div id="my-page">
				<Tabs
					value={tabs.some((ele) => ele.key === category) ? category : false}
					onChange={(e, value) => changeCategoryHandler(value)}
					variant={'scrollable'}
					scrollButtons={false}
					className={'my-tabs'}
				>
					{tabs.map((tab) => (
						<Tab key={tab.key} value={tab.key} label={t(tab.label)} />
					))}
				</Tabs>
				{body}
			</div>
		);
	} else {
		return (
			<div id="my-page">
				<Stack className={'container'}>
					<MyMenu category={category} />
					{body}
				</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(MyPage);
