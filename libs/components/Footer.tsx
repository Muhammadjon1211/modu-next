import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../hooks/useDeviceDetect';

const Footer = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const year = new Date().getFullYear();

	const links = [
		{ label: 'Shop', href: '/product' },
		{ label: 'Sellers', href: '/seller' },
		{ label: 'Community', href: '/community' },
		{ label: 'Cart', href: '/cart' },
	];

	if (device === 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<img className={'logo'} src={'/img/logo/logoWhite.svg'} alt={'modu'} />
				<Stack className={'links'}>
					{links.map((link) => (
						<Link key={link.href} href={link.href}>
							{t(link.label)}
						</Link>
					))}
				</Stack>
				<span className={'copy'}>© {year} Modu</span>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'container'}>
					<Stack className={'footer-top'}>
						<img className={'logo'} src={'/img/logo/logoWhite.svg'} alt={'modu'} />
						<Stack className={'links'}>
							{links.map((link) => (
								<Link key={link.href} href={link.href}>
									{t(link.label)}
								</Link>
							))}
						</Stack>
					</Stack>
					<Stack className={'footer-bottom'}>
						<span>© {year} Modu</span>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
