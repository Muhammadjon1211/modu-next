import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';
import Top from '../Top';
import Footer from '../Footer';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();

		/** the single place page banners are configured — title only, no sub copy */
		const memoizedValues = useMemo(() => {
			let title = '';
			switch (router.pathname) {
				case '/product':
					title = 'Shop';
					break;
				case '/shop':
					title = 'Shops';
					break;
				case '/community':
					title = 'Community';
					break;
				case '/cart':
					title = 'Cart';
					break;
				case '/checkout':
					title = 'Checkout';
					break;
				case '/mypage':
					title = 'My page';
					break;
				default:
					break;
			}
			return { title };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		const pageTitle = memoizedValues.title ? `${t(memoizedValues.title)} · Modu` : 'Modu';

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>{pageTitle}</title>
						<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>
						{memoizedValues.title && (
							<Stack className={'header-basic'}>
								<h1>{t(memoizedValues.title)}</h1>
							</Stack>
						)}
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>{pageTitle}</title>
						<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>
						{memoizedValues.title && (
							<Stack className={'header-basic'}>
								<Stack className={'container'}>
									<h1>{t(memoizedValues.title)}</h1>
								</Stack>
							</Stack>
						)}
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
