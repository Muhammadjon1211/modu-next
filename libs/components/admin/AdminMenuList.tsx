import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

const menus = [
	{ title: 'Dashboard', href: '/_admin', icon: <SpaceDashboardOutlinedIcon /> },
	{ title: 'Users', href: '/_admin/users', icon: <PeopleAltOutlinedIcon /> },
	{ title: 'Stores', href: '/_admin/stores', icon: <StorefrontOutlinedIcon /> },
	{ title: 'Products', href: '/_admin/products', icon: <CheckroomOutlinedIcon /> },
	{ title: 'Orders', href: '/_admin/orders', icon: <ReceiptLongOutlinedIcon /> },
	{ title: 'Returns', href: '/_admin/returns', icon: <AssignmentReturnOutlinedIcon /> },
	{ title: 'Community', href: '/_admin/community', icon: <ForumOutlinedIcon /> },
];

const AdminMenuList = () => {
	const router = useRouter();

	return (
		<List className={'admin-menu'}>
			{menus.map((menu) => (
				<Link key={menu.href} href={menu.href}>
					<ListItemButton
						selected={menu.href === '/_admin' ? router.pathname === menu.href : router.pathname.startsWith(menu.href)}
						className={'admin-menu-item'}
					>
						<ListItemIcon>{menu.icon}</ListItemIcon>
						<ListItemText primary={menu.title} />
					</ListItemButton>
				</Link>
			))}
		</List>
	);
};

export default AdminMenuList;
