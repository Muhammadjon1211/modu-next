import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import SellerCard from '../common/SellerCard';
import { Member } from '../../types/member/member';
import { SellersInquiry } from '../../types/member/member.input';
import { GET_SELLERS } from '../../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { likeTargetMemberHandler } from '../../utils';
import { Direction } from '../../enums/common.enum';
import { T } from '../../types/common';

interface TopSellersType {
	initialInput?: SellersInquiry;
}

const TopSellers = (props: TopSellersType) => {
	const { initialInput = { page: 1, limit: 4, sort: 'memberRank', direction: Direction.DESC, search: {} } } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [sellers, setSellers] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { refetch } = useQuery(GET_SELLERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSellers(data?.getSellers?.list ?? []);
		},
	});

	/** HANDLERS **/
	const likeMemberHandler = async (id: string) => {
		await likeTargetMemberHandler(likeTargetMember, id, user?._id);
		await refetch({ input: initialInput });
	};

	if (!sellers.length) return null;

	return (
		<Stack className={'top-sellers'}>
			<Stack className={'container'}>
				<Stack className={'section-head'}>
					<h2>{t('Top shops')}</h2>
					<Link href={'/seller'} className={'see-all'}>
						{t('See all')} <ArrowForwardRoundedIcon />
					</Link>
				</Stack>
				<Stack className={device === 'mobile' ? 'seller-scroll' : 'seller-grid'}>
					{sellers.map((seller) => (
						<SellerCard key={seller._id} seller={seller} likeMemberHandler={likeMemberHandler} />
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TopSellers;
