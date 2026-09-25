import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Skeleton, Stack } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ProductCard from '../common/ProductCard';
import { Product } from '../../types/product/product';
import { GET_RECOMMENDATIONS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { likeTargetProductHandler } from '../../utils';
import { T } from '../../types/common';

interface RecommendedSectionType {
	limit?: number;
	className?: string;
}

/** personal picks for a member with activity; trending / best sellers for guests and new members */
const RecommendedSection = (props: RecommendedSectionType) => {
	const { limit = 8, className = '' } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [products, setProducts] = useState<Product[]>([]);
	const [personalized, setPersonalized] = useState<boolean>(false);
	const firstRender = useRef<boolean>(true);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading, refetch } = useQuery(GET_RECOMMENDATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { limit },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getRecommendations?.list ?? []);
			setPersonalized(!!data?.getRecommendations?.personalized);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// signing in or out swaps trending for personal picks and back; the mount itself is already fetched
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		refetch({ limit }).then();
	}, [user?._id]);

	/** HANDLERS **/
	const likeProductHandler = async (id: string) => {
		await likeTargetProductHandler(likeTargetProduct, id, user?._id);
		await refetch({ limit });
	};

	if (!loading && !products.length) return null;

	return (
		<Stack className={`product-section recommended ${className}`}>
			<Stack className={'container'}>
				<Stack className={'section-head'}>
					<h2>
						{personalized && <AutoAwesomeRoundedIcon className={'ai-icon'} />}
						{t(personalized ? 'Picked for you' : 'Trending now')}
					</h2>
				</Stack>
				<Stack className={device === 'mobile' ? 'product-scroll' : 'product-grid'}>
					{loading && !products.length
						? Array.from({ length: limit }).map((_, index) => (
								<Stack key={index} className={'product-card'}>
									<Skeleton variant={'rounded'} className={'skeleton-img'} />
									<Skeleton width={'40%'} />
									<Skeleton width={'80%'} />
								</Stack>
							))
						: products.map((product) => (
								<ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
							))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default RecommendedSection;
