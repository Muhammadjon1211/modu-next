import React from 'react';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminDashboard from '../../libs/components/admin/dashboard/AdminDashboard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AdminHome: NextPage = () => {
	return (
		<Stack className={'admin-page plain'}>
			<h2 className={'admin-title'}>Dashboard</h2>
			<AdminDashboard />
		</Stack>
	);
};

export default withAdminLayout(AdminHome);
