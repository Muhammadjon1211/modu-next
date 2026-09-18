import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';

/** the admin sign-in shell — no storefront chrome, no admin drawer */
const withAdminAuthLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			if (user?.memberType === MemberType.ADMIN) router.replace('/_admin').then();
		}, [user, router]);

		/** HANDLERS **/

		return (
			<>
				<Head>
					<title>Modu Admin</title>
					<meta name={'robots'} content={'noindex,nofollow'} />
					<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
				</Head>
				<Stack id="pc-wrap" className={'admin-auth-wrap'}>
					<Component {...props} />
				</Stack>
			</>
		);
	};
};

export default withAdminAuthLayout;
