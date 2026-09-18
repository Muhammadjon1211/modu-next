import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Avatar, IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Member } from '../../types/member/member';
import { formatterStr, getImageUrl, getMemberImage, imageFallbackHandler } from '../../utils';

interface SellerCardType {
	seller: Member;
	likeMemberHandler?: any;
}

const SellerCard = (props: SellerCardType) => {
	const { seller, likeMemberHandler } = props;
	const { t } = useTranslation('common');
	const liked: boolean = !!seller?.meLiked?.[0]?.myFavorite;
	const href = { pathname: '/member', query: { memberId: seller?._id } };

	return (
		<Stack className={'seller-card'}>
			<Link href={href} className={'banner'}>
				{seller?.memberShopBanner ? (
					<img
						src={getImageUrl(seller.memberShopBanner, '/img/banner/shop.svg')}
						alt={''}
						onError={imageFallbackHandler('/img/banner/shop.svg')}
					/>
				) : (
					<span className={'banner-fill'} />
				)}
			</Link>
			<Stack className={'seller-body'}>
				<Link href={href}>
					<Avatar
						className={'seller-avatar'}
						src={getMemberImage(seller?.memberImage)}
						alt={seller?.memberNick}
						imgProps={{ onError: imageFallbackHandler('/img/profile/defaultUser.svg') }}
					/>
				</Link>
				<Stack className={'seller-name'}>
					<Link href={href}>{seller?.memberShopName || seller?.memberNick}</Link>
					<span>@{seller?.memberNick}</span>
				</Stack>
				{likeMemberHandler && (
					<IconButton
						className={`like-btn ${liked ? 'liked' : ''}`}
						aria-label={'like'}
						onClick={() => likeMemberHandler(seller?._id)}
					>
						{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</IconButton>
				)}
			</Stack>
			<Stack className={'seller-stats'}>
				<Stack>
					<strong>{formatterStr(seller?.memberProducts)}</strong>
					<span>{t('Products')}</span>
				</Stack>
				<Stack>
					<strong>{formatterStr(seller?.memberFollowers)}</strong>
					<span>{t('Followers')}</span>
				</Stack>
				<Stack>
					<strong>{formatterStr(seller?.memberSales)}</strong>
					<span>{t('Sold')}</span>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default SellerCard;
