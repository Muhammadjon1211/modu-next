import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { AppBar, Avatar, Box, Button, Drawer, IconButton, Stack, Toolbar } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { userVar } from '../../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { getMemberImage } from '../../utils';
import { MemberType } from '../../enums/member.enum';
import AdminMenuList from '../admin/AdminMenuList';

const drawerWidth = 280;

const withAdminLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [loading, setLoading] = useState<boolean>(true);
		const [menuOpen, setMenuOpen] = useState<boolean>(false);
		const device = useDeviceDetect();
		// on a phone the menu slides in instead of taking 280px of a 390px screen
		const mobile = device === 'mobile';

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.replace('/_admin/login').then();
			}
		}, [loading, user, router]);

		useEffect(() => {
			setMenuOpen(false);
		}, [router.asPath]);

		/** HANDLERS **/

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<>
				<Head>
					<title>Modu Admin</title>
					<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
					<meta name={'robots'} content={'noindex,nofollow'} />
				</Head>
				<Stack id="pc-wrap" className={'admin-wrap'}>
					<AppBar
						position="fixed"
						className={'admin-appbar'}
						sx={mobile ? { width: '100%' } : { width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
					>
						<Toolbar className={'admin-topbar'}>
							{mobile ? (
								<IconButton onClick={() => setMenuOpen(true)} aria-label={'menu'}>
									<MenuRoundedIcon />
								</IconButton>
							) : (
								<Box />
							)}
							<Stack className={'admin-user'}>
								<Avatar src={getMemberImage(user.memberImage)} />
								<strong>{user.memberNick}</strong>
								<Button size={'small'} variant={'outlined'} onClick={() => logOut('/_admin/login')}>
									Logout
								</Button>
							</Stack>
						</Toolbar>
					</AppBar>

					<Drawer
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							'& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
						}}
						variant={mobile ? 'temporary' : 'permanent'}
						open={mobile ? menuOpen : true}
						onClose={() => setMenuOpen(false)}
						anchor="left"
						className={'admin-drawer'}
					>
						<Link href={'/_admin'} className={'admin-logo'}>
							<img src={'/img/logo/logo.svg'} alt={'modu'} />
							<span>admin</span>
						</Link>
						<AdminMenuList />
					</Drawer>

					<Box component={'main'} className={'admin-main'} sx={{ ml: mobile ? 0 : `${drawerWidth}px` }}>
						<Component {...props} />
					</Box>
				</Stack>
			</>
		);
	};
};

export default withAdminLayout;
