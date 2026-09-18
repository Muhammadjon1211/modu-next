import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { Avatar, Stack } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { getMemberImage } from '../../utils';
import { MemberType } from '../../enums/member.enum';

interface MyMenuType {
	category: string;
}

const MyMenu = (props: MyMenuType) => {
	const { category } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const isSeller = user?.memberType === MemberType.SELLER;

	const groups = [
		{
			title: 'Shopping',
			items: [
				{ key: 'myOrders', label: 'Orders', icon: <ReceiptLongOutlinedIcon /> },
				{ key: 'myReturns', label: 'Returns', icon: <AssignmentReturnOutlinedIcon /> },
				{ key: 'myFavorites', label: 'Favorites', icon: <FavoriteBorderRoundedIcon /> },
				{ key: 'recentlyVisited', label: 'Recently viewed', icon: <HistoryRoundedIcon /> },
			],
		},
		...(isSeller
			? [
					{
						title: 'My shop',
						items: [
							{ key: 'myProducts', label: 'Products', icon: <CheckroomOutlinedIcon /> },
							{ key: 'addProduct', label: 'Add product', icon: <AddBoxOutlinedIcon /> },
							{ key: 'sellerOrders', label: 'Sales', icon: <PointOfSaleOutlinedIcon /> },
							{ key: 'sellerReturns', label: 'Return requests', icon: <MoveToInboxOutlinedIcon /> },
						],
					},
				]
			: []),
		{
			title: 'Community',
			items: [
				{ key: 'myArticles', label: 'My posts', icon: <ArticleOutlinedIcon /> },
				{ key: 'writeArticle', label: 'Write', icon: <EditNoteRoundedIcon /> },
				{ key: 'followers', label: 'Followers', icon: <PeopleOutlineRoundedIcon /> },
				{ key: 'followings', label: 'Following', icon: <PersonAddAltRoundedIcon /> },
			],
		},
		{
			title: 'Account',
			items: [
				{ key: 'myProfile', label: 'Profile', icon: <PersonOutlineRoundedIcon /> },
				{ key: 'myAddresses', label: 'Addresses', icon: <PlaceOutlinedIcon /> },
				{ key: 'myPayments', label: 'Payment methods', icon: <CreditCardOutlinedIcon /> },
			],
		},
	];

	return (
		<Stack className={'my-menu'}>
			<Link href={{ pathname: '/member', query: { memberId: user?._id } }} className={'my-card'}>
				<Avatar src={getMemberImage(user?.memberImage)} />
				<Stack>
					<strong>{user?.memberNick}</strong>
					<span>{t(user?.memberType)}</span>
				</Stack>
			</Link>
			{groups.map((group) => (
				<Stack key={group.title} className={'menu-group'}>
					<span className={'group-title'}>{t(group.title)}</span>
					{group.items.map((item) => (
						<Link
							key={item.key}
							href={{ pathname: '/mypage', query: { category: item.key } }}
							scroll={false}
							className={`menu-item ${category === item.key ? 'active' : ''}`}
						>
							{item.icon}
							<span>{t(item.label)}</span>
						</Link>
					))}
				</Stack>
			))}
			<button className={'menu-item logout'} onClick={() => logOut()}>
				<LogoutRoundedIcon />
				<span>{t('Logout')}</span>
			</button>
		</Stack>
	);
};

export default MyMenu;
