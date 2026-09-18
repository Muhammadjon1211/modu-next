import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { Avatar, Button, IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { Member } from '../../types/member/member';
import { MemberType } from '../../enums/member.enum';
import { userVar } from '../../../apollo/store';
import { formatterStr, getImageUrl, getMemberImage, imageFallbackHandler } from '../../utils';

interface MemberHeaderType {
	member: Member;
	followHandler: () => void;
	likeHandler: () => void;
}

const MemberHeader = (props: MemberHeaderType) => {
	const { member, followHandler, likeHandler } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const isSeller = member.memberType === MemberType.SELLER;
	const isMe = user?._id === member._id;
	const following = !!member.meFollowed?.length;
	const liked = !!member.meLiked?.[0]?.myFavorite;

	const stats = [
		...(isSeller ? [{ label: 'Products', value: member.memberProducts }] : []),
		{ label: 'Followers', value: member.memberFollowers },
		{ label: 'Following', value: member.memberFollowings },
		{ label: 'Likes', value: member.memberLikes },
	];

	return (
		<Stack className={'member-header'}>
			<Stack className={'member-banner'}>
				{member.memberShopBanner ? (
					<img
						src={getImageUrl(member.memberShopBanner, '/img/banner/shop.svg')}
						alt={''}
						onError={imageFallbackHandler('/img/banner/shop.svg')}
					/>
				) : (
					<span className={'banner-fill'} />
				)}
			</Stack>
			<Stack className={'member-row'}>
				<Avatar
					className={'member-avatar'}
					src={getMemberImage(member.memberImage)}
					imgProps={{ onError: imageFallbackHandler('/img/profile/defaultUser.svg') }}
				/>
				<Stack className={'member-name'}>
					<h1>
						{member.memberShopName || member.memberNick}
						{isSeller && <VerifiedRoundedIcon />}
					</h1>
					<span>@{member.memberNick}</span>
				</Stack>
				<Stack className={'member-actions'}>
					{isMe ? (
						<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }}>
							<Button variant={'outlined'}>{t('Edit profile')}</Button>
						</Link>
					) : (
						<>
							<Button variant={following ? 'outlined' : 'contained'} onClick={followHandler}>
								{following ? t('Following') : t('Follow')}
							</Button>
							<IconButton className={`like-btn ${liked ? 'liked' : ''}`} onClick={likeHandler}>
								{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							</IconButton>
						</>
					)}
				</Stack>
			</Stack>
			{member.memberDesc && <p className={'member-desc'}>{member.memberDesc}</p>}
			<Stack className={'member-stats'}>
				{stats.map((stat) => (
					<Stack key={stat.label}>
						<strong>{formatterStr(stat.value)}</strong>
						<span>{t(stat.label)}</span>
					</Stack>
				))}
			</Stack>
		</Stack>
	);
};

export default MemberHeader;
