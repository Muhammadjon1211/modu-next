import React from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutHome from '../libs/components/layout/LayoutHome';
import HeroBanner from '../libs/components/homepage/HeroBanner';
import CategoryStrip from '../libs/components/homepage/CategoryStrip';
import ProductSection from '../libs/components/homepage/ProductSection';
import TopSellers from '../libs/components/homepage/TopSellers';
import CommunityPreview from '../libs/components/homepage/CommunityPreview';
import { Direction } from '../libs/enums/common.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	const newArrivals = { page: 1, limit: 8, sort: 'createdAt', direction: Direction.DESC, search: {} };
	const onSale = {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { options: ['productOnSale'] },
	};
	const bestSellers = { page: 1, limit: 4, sort: 'productSales', direction: Direction.DESC, search: {} };

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<HeroBanner />
				<CategoryStrip />
				<ProductSection title={'New arrivals'} input={newArrivals} />
				<ProductSection title={'On sale'} input={onSale} />
				<TopSellers />
				<ProductSection title={'Best sellers'} input={bestSellers} />
				<CommunityPreview />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<HeroBanner />
				<CategoryStrip />
				<ProductSection title={'New arrivals'} input={newArrivals} />
				<ProductSection title={'On sale'} input={onSale} className={'tinted'} />
				<TopSellers />
				<ProductSection title={'Best sellers'} input={bestSellers} />
				<CommunityPreview />
			</Stack>
		);
	}
};

export default withLayoutHome(Home);
