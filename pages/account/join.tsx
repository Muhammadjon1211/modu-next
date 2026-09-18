import React, { FormEvent, useCallback, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { logIn, signUp } from '../../libs/auth';
import { userVar } from '../../apollo/store';
import { MemberType } from '../../libs/enums/member.enum';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface JoinInput {
	nick: string;
	password: string;
	phone: string;
	type: MemberType;
}

const Join: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [input, setInput] = useState<JoinInput>({ nick: '', password: '', phone: '', type: MemberType.USER });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** HANDLERS **/
	const viewChangeHandler = (isLogin: boolean) => {
		setLoginView(isLogin);
		setShowPassword(false);
	};

	const handleInput = useCallback((name: keyof JoinInput, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		try {
			if (!input.nick || !input.password) throw new Error(Messages.error3);
			setSubmitting(true);
			await logIn(input.nick, input.password);
			// admins work in their own interface, not the storefront
			if (userVar().memberType === MemberType.ADMIN) await router.push('/_admin');
			else await router.push((router.query?.back as string) ?? '/');
		} catch (err: any) {
			if (err.message === Messages.error3) sweetMixinErrorAlert(t(err.message)).then();
		} finally {
			setSubmitting(false);
		}
	}, [input, router, t]);

	const doSignUp = useCallback(async () => {
		try {
			if (!input.nick || !input.password || !input.phone) throw new Error(Messages.error3);
			setSubmitting(true);
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(input.type === MemberType.SELLER ? '/mypage?category=myProfile' : '/');
		} catch (err: any) {
			if (err.message === Messages.error3) sweetMixinErrorAlert(t(err.message)).then();
		} finally {
			setSubmitting(false);
		}
	}, [input, router, t]);

	const submitHandler = (e: FormEvent) => {
		e.preventDefault();
		if (loginView) doLogin().then();
		else doSignUp().then();
	};

	const form = (
		<form className={'join-form'} onSubmit={submitHandler}>
			<Stack className={'join-tabs'}>
				<button type={'button'} className={loginView ? 'active' : ''} onClick={() => viewChangeHandler(true)}>
					{t('Login')}
				</button>
				<button type={'button'} className={!loginView ? 'active' : ''} onClick={() => viewChangeHandler(false)}>
					{t('Sign up')}
				</button>
			</Stack>

			<TextField
				label={t('Nickname')}
				value={input.nick}
				onChange={(e) => handleInput('nick', e.target.value)}
				inputProps={{ minLength: 3, maxLength: 12 }}
				autoComplete={'username'}
				fullWidth
				required
			/>
			<TextField
				label={t('Password')}
				type={showPassword ? 'text' : 'password'}
				value={input.password}
				onChange={(e) => handleInput('password', e.target.value)}
				inputProps={{ minLength: 5, maxLength: 12 }}
				autoComplete={loginView ? 'current-password' : 'new-password'}
				fullWidth
				required
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
			{!loginView && (
				<>
					<TextField
						label={t('Phone')}
						value={input.phone}
						onChange={(e) => handleInput('phone', e.target.value)}
						autoComplete={'tel'}
						fullWidth
						required
					/>
					<Stack className={'type-select'}>
						<button
							type={'button'}
							className={input.type === MemberType.USER ? 'active' : ''}
							onClick={() => handleInput('type', MemberType.USER)}
						>
							{t('Buyer')}
						</button>
						<button
							type={'button'}
							className={input.type === MemberType.SELLER ? 'active' : ''}
							onClick={() => handleInput('type', MemberType.SELLER)}
						>
							{t('Shop owner')}
						</button>
					</Stack>
				</>
			)}

			<Button type={'submit'} variant={'contained'} size={'large'} fullWidth disabled={submitting}>
				{loginView ? t('Login') : t('Create account')}
			</Button>
		</form>
	);

	if (device === 'mobile') {
		return <div id="join-page">{form}</div>;
	} else {
		return (
			<div id="join-page">
				<Stack className={'container'}>
					<Stack className={'join-art'}>
						<img src={'/img/banner/join.svg'} alt={''} />
					</Stack>
					<Stack className={'join-panel'}>
						<h2>{loginView ? t('Welcome back') : t('Join Modu')}</h2>
						{form}
					</Stack>
				</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(Join);
