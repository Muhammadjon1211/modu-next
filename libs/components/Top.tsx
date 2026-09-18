import React, { KeyboardEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
	Avatar,
	Badge,
	Box,
	Button,
	Divider,
	Drawer,
	IconButton,
	InputBase,
	Menu,
	MenuItem,
	Stack,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { cartCountVar, userVar } from '../../apollo/store';
import { GET_MY_CART } from '../../apollo/user/query';
import { logOut } from '../auth';
import { getMemberImage } from '../utils';
import { MemberType } from '../enums/member.enum';
import { ProductGroup } from '../enums/product.enum';
import { T } from '../types/common';

const languages = [
	{ locale: 'en', label: 'EN' },
	{ locale: 'kr', label: 'KR' },
	{ locale: 'ru', label: 'RU' },
];

const Top = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const cartCount = useReactiveVar(cartCountVar);
	const [searchText, setSearchText] = useState<string>('');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
	const [scrolled, setScrolled] = useState<boolean>(false);

	const navLinks = [
		{ label: 'Clothes', href: `/product?input=${JSON.stringify(groupInput(ProductGroup.CLOTHES))}`, group: 'CLOTHES' },
		{
			label: 'Accessories',
			href: `/product?input=${JSON.stringify(groupInput(ProductGroup.ACCESSORIES))}`,
			group: 'ACCESSORIES',
		},
		{ label: 'Shops', href: '/shop' },
		{ label: 'Community', href: '/community' },
	];

	/** APOLLO REQUESTS **/
	useQuery(GET_MY_CART, {
		fetchPolicy: 'network-only',
		skip: !user?._id,
		onCompleted: (data: T) => {
			cartCountVar(data?.getMyCart?.orderItems?.length ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const scrollHandler = () => setScrolled(window.scrollY > 8);
		window.addEventListener('scroll', scrollHandler);
		return () => window.removeEventListener('scroll', scrollHandler);
	}, []);

	useEffect(() => {
		setDrawerOpen(false);
	}, [router.asPath]);

	/** HANDLERS **/
	const searchHandler = async (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		const input = { page: 1, limit: 12, sort: 'createdAt', direction: 'DESC', search: { text: searchText.trim() } };
		await router.push(`/product?input=${JSON.stringify(input)}`, `/product?input=${JSON.stringify(input)}`);
	};

	const changeLanguageHandler = async (locale: string) => {
		setLangAnchor(null);
		await router.push(router.asPath, router.asPath, { locale });
	};

	const isActive = (link: T): boolean => {
		if (link.group) return router.pathname === '/product' && String(router.query?.input ?? '').includes(link.group);
		return router.pathname.startsWith(link.href);
	};

	const currentLang = languages.find((ele) => ele.locale === router.locale) ?? languages[0];

	const actions = (
		<Stack className={'top-actions'}>
			{user?._id && (
				<Link href={{ pathname: '/mypage', query: { category: 'myFavorites' } }}>
					<IconButton className={'icon-btn'} aria-label={'favorites'}>
						<FavoriteBorderRoundedIcon />
					</IconButton>
				</Link>
			)}
			<Link href={'/cart'}>
				<IconButton className={'icon-btn'} aria-label={'cart'}>
					<Badge badgeContent={cartCount} color={'secondary'}>
						<ShoppingBagOutlinedIcon />
					</Badge>
				</IconButton>
			</Link>
			{user?._id ? (
				<>
					<IconButton className={'avatar-btn'} onClick={(e) => setUserAnchor(e.currentTarget)}>
						<Avatar src={getMemberImage(user.memberImage)} alt={user.memberNick} />
					</IconButton>
					<Menu
						anchorEl={userAnchor}
						open={Boolean(userAnchor)}
						onClose={() => setUserAnchor(null)}
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						transformOrigin={{ vertical: 'top', horizontal: 'right' }}
						className={'user-menu'}
					>
						<Box className={'user-menu-head'}>
							<strong>{user.memberNick}</strong>
							<span>{t(user.memberType)}</span>
						</Box>
						<Divider />
						<MenuItem onClick={() => router.push('/mypage').then(() => setUserAnchor(null))}>{t('My page')}</MenuItem>
						<MenuItem onClick={() => router.push('/mypage?category=myOrders').then(() => setUserAnchor(null))}>
							{t('Orders')}
						</MenuItem>
						{user.memberType === MemberType.SELLER && (
							<MenuItem onClick={() => router.push('/mypage?category=myProducts').then(() => setUserAnchor(null))}>
								{t('My shop')}
							</MenuItem>
						)}
						{user.memberType === MemberType.ADMIN && (
							<MenuItem onClick={() => router.push('/_admin').then(() => setUserAnchor(null))}>{t('Admin')}</MenuItem>
						)}
						<Divider />
						<MenuItem onClick={() => logOut()}>{t('Logout')}</MenuItem>
					</Menu>
				</>
			) : (
				<Link href={'/account/join'}>
					<Button variant={'contained'} className={'login-btn'}>
						{t('Login')}
					</Button>
				</Link>
			)}
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${scrolled ? 'scrolled' : ''}`}>
					<IconButton onClick={() => setDrawerOpen(true)} aria-label={'menu'}>
						<MenuRoundedIcon />
					</IconButton>
					<Link href={'/'} className={'logo'}>
						<img src={'/img/logo/logo.svg'} alt={'modu'} />
					</Link>
					<Link href={'/cart'}>
						<IconButton aria-label={'cart'}>
							<Badge badgeContent={cartCount} color={'secondary'}>
								<ShoppingBagOutlinedIcon />
							</Badge>
						</IconButton>
					</Link>
				</Stack>
				<Drawer anchor={'left'} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
					<Stack className={'mobile-drawer'}>
						<Stack className={'drawer-head'}>
							<img src={'/img/logo/logo.svg'} alt={'modu'} />
							<IconButton onClick={() => setDrawerOpen(false)}>
								<CloseRoundedIcon />
							</IconButton>
						</Stack>
						<Box className={'search-box'}>
							<SearchRoundedIcon />
							<InputBase
								placeholder={t('Search')}
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								onKeyDown={searchHandler}
							/>
						</Box>
						<Stack className={'drawer-links'}>
							{navLinks.map((link) => (
								<Link key={link.label} href={link.href} className={isActive(link) ? 'active' : ''}>
									{t(link.label)}
								</Link>
							))}
							{user?._id && <Link href={'/mypage'}>{t('My page')}</Link>}
							{user?.memberType === MemberType.ADMIN && <Link href={'/_admin'}>{t('Admin')}</Link>}
						</Stack>
						<Stack className={'drawer-langs'}>
							{languages.map((lang) => (
								<Button
									key={lang.locale}
									size={'small'}
									variant={lang.locale === currentLang.locale ? 'contained' : 'outlined'}
									onClick={() => changeLanguageHandler(lang.locale)}
								>
									{lang.label}
								</Button>
							))}
						</Stack>
						<Box className={'drawer-foot'}>
							{user?._id ? (
								<Button fullWidth variant={'outlined'} onClick={() => logOut()}>
									{t('Logout')}
								</Button>
							) : (
								<Link href={'/account/join'}>
									<Button fullWidth variant={'contained'}>
										{t('Login')}
									</Button>
								</Link>
							)}
						</Box>
					</Stack>
				</Drawer>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${scrolled ? 'scrolled' : ''}`}>
					<Stack className={'container'}>
						<Link href={'/'} className={'logo'}>
							<img src={'/img/logo/logo.svg'} alt={'modu'} />
						</Link>
						<Stack component={'nav'} className={'router-box'}>
							{navLinks.map((link) => (
								<Link key={link.label} href={link.href} className={isActive(link) ? 'active' : ''}>
									{t(link.label)}
								</Link>
							))}
						</Stack>
						<Stack className={'right-box'}>
							<Box className={'search-box'}>
								<SearchRoundedIcon />
								<InputBase
									placeholder={t('Search')}
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onKeyDown={searchHandler}
								/>
							</Box>
							<Button className={'lang-btn'} onClick={(e) => setLangAnchor(e.currentTarget)}>
								<img src={`/img/flag/lang${currentLang.locale}.svg`} alt={''} />
								{currentLang.label}
							</Button>
							<Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
								{languages.map((lang) => (
									<MenuItem
										key={lang.locale}
										className={'lang-item'}
										selected={lang.locale === currentLang.locale}
										onClick={() => changeLanguageHandler(lang.locale)}
									>
										<img src={`/img/flag/lang${lang.locale}.svg`} alt={''} />
										{lang.label}
									</MenuItem>
								))}
							</Menu>
							{actions}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

const groupInput = (group: ProductGroup) => ({
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: 'DESC',
	search: { group },
});

export default Top;
