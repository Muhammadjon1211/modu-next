import React from 'react';
import { Avatar, Button, MenuItem, Select, Stack } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Member } from '../../../types/member/member';
import { StoreSummary } from '../../../types/order/order';
import { MemberStatus } from '../../../enums/member.enum';
import {
	formatDate,
	formatPrice,
	formatterStr,
	getImageUrl,
	getMemberImage,
	imageFallbackHandler,
} from '../../../utils';

interface StoreHeaderType {
	store: Member;
	summary: StoreSummary | null;
	returnCount: number;
	updateStatusHandler: (status: MemberStatus) => void;
}

const StoreHeader = (props: StoreHeaderType) => {
	const { store, summary, returnCount, updateStatusHandler } = props;

	const stats = [
		{ label: 'Gross sales', value: formatPrice(summary?.grossSales), accent: true },
		{ label: 'Orders', value: formatterStr(summary?.orderCount) },
		{ label: 'Units sold', value: formatterStr(summary?.unitsSold) },
		{ label: 'Customers', value: formatterStr(summary?.customerCount) },
		{ label: 'Products', value: formatterStr(store.memberProducts) },
		{ label: 'Returns', value: formatterStr(returnCount) },
	];

	return (
		<Stack className={'store-header'}>
			<Stack className={'store-banner'}>
				{store.memberShopBanner ? (
					<img
						src={getImageUrl(store.memberShopBanner, '/img/banner/shop.svg')}
						alt={''}
						onError={imageFallbackHandler('/img/banner/shop.svg')}
					/>
				) : (
					<span className={'banner-fill'} />
				)}
			</Stack>
			<Stack className={'store-identity'}>
				<Avatar className={'store-avatar'} src={getMemberImage(store.memberImage)} />
				<Stack className={'store-name'}>
					<h2>{store.memberShopName || store.memberNick}</h2>
					<span>
						@{store.memberNick} · {store.memberPhone} · since {formatDate(store.createdAt)}
					</span>
				</Stack>
				<Stack className={'store-actions'}>
					<Button
						variant={'outlined'}
						size={'small'}
						endIcon={<OpenInNewRoundedIcon />}
						href={`/member?memberId=${store._id}`}
						target={'_blank'}
						rel={'noreferrer'}
					>
						Shop page
					</Button>
					<Select
						size={'small'}
						value={store.memberStatus}
						className={`status-select ${store.memberStatus.toLowerCase()}`}
						onChange={(e) => updateStatusHandler(e.target.value as MemberStatus)}
					>
						{Object.values(MemberStatus).map((status) => (
							<MenuItem key={status} value={status}>
								{status}
							</MenuItem>
						))}
					</Select>
				</Stack>
			</Stack>
			<Stack className={'store-stats'}>
				{stats.map((stat) => (
					<Stack key={stat.label} className={`store-stat ${stat.accent ? 'accent' : ''}`}>
						<strong>{stat.value}</strong>
						<span>{stat.label}</span>
					</Stack>
				))}
			</Stack>
		</Stack>
	);
};

export default StoreHeader;
