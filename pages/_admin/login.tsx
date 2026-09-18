import React, { FormEvent, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminAuthLayout from '../../libs/components/layout/LayoutAdminAuth';
import { userVar } from '../../apollo/store';
import { clearSession, logIn } from '../../libs/auth';
import { MemberType } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AdminLogin: NextPage = () => {
	const router = useRouter();
	const [nick, setNick] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** HANDLERS **/
	const loginHandler = async (e: FormEvent) => {
		e.preventDefault();
		try {
			if (!nick || !password) throw new Error(Messages.error3);
			setSubmitting(true);
			await logIn(nick, password);

			// a valid shopper account is still not an admin — do not keep it signed in here
			if (userVar().memberType !== MemberType.ADMIN) {
				clearSession();
				throw new Error(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
			}
			await router.replace('/_admin');
		} catch (err: any) {
			// logIn already alerted for wrong nick / password / blocked
			if (err.message !== 'Login Err') sweetMixinErrorAlert(err.message).then();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Stack className={'admin-login'}>
			<form className={'admin-login-card'} onSubmit={loginHandler}>
				<Stack className={'admin-login-brand'}>
					<img src={'/img/logo/logo.svg'} alt={'modu'} />
					<span>admin</span>
				</Stack>
				<TextField
					label={'Nickname'}
					value={nick}
					onChange={(e) => setNick(e.target.value)}
					autoComplete={'username'}
					autoFocus
					fullWidth
				/>
				<TextField
					label={'Password'}
					type={showPassword ? 'text' : 'password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					autoComplete={'current-password'}
					fullWidth
					InputProps={{
						endAdornment: (
							<InputAdornment position={'end'}>
								<IconButton onClick={() => setShowPassword(!showPassword)} edge={'end'}>
									{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
				<Button type={'submit'} variant={'contained'} size={'large'} fullWidth disabled={submitting}>
					Sign in
				</Button>
			</form>
		</Stack>
	);
};

export default withAdminAuthLayout(AdminLogin);
