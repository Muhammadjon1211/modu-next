import React, { FormEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Button, CircularProgress, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminAuthLayout from '../../libs/components/layout/LayoutAdminAuth';
import { userVar } from '../../apollo/store';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { clearSession, logIn } from '../../libs/auth';
import { MemberType } from '../../libs/enums/member.enum';
import { Message, Direction } from '../../libs/enums/common.enum';
import { Messages } from '../../libs/config';
import { getImageUrl } from '../../libs/utils';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const rotatingWords = ['shops', 'orders', 'returns', 'products', 'community'];
const headline = ['Welcome', 'back.'];

const greetingFor = (hour: number): string => {
	if (hour < 5) return 'Up late';
	if (hour < 12) return 'Good morning';
	if (hour < 18) return 'Good afternoon';
	return 'Good evening';
};

const AdminLogin: NextPage = () => {
	const router = useRouter();
	const [nick, setNick] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [shake, setShake] = useState<boolean>(false);
	const [wordIndex, setWordIndex] = useState<number>(0);
	const [now, setNow] = useState<Date | null>(null);
	const [photos, setPhotos] = useState<string[]>([]);

	/** APOLLO REQUESTS **/
	// the newest shop photos dress the welcome panel; the placeholder art covers an empty shop
	useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 6, sort: 'createdAt', direction: Direction.DESC, search: {} } },
		onCompleted: (data: T) => {
			const images: string[] = (data?.getProducts?.list ?? [])
				.map((ele: T) => ele.productImages?.[0])
				.filter(Boolean)
				.slice(0, 3);
			setPhotos(images.map((ele) => getImageUrl(ele)));
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// the clock starts on the client only, so server and client render the same markup
		setNow(new Date());
		const clock = setInterval(() => setNow(new Date()), 1000 * 30);
		const words = setInterval(() => setWordIndex((prev) => (prev + 1) % rotatingWords.length), 2400);
		return () => {
			clearInterval(clock);
			clearInterval(words);
		};
	}, []);

	/** HANDLERS **/
	const failHandler = () => {
		setShake(true);
		setTimeout(() => setShake(false), 500);
	};

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
			failHandler();
			// logIn already alerted for wrong nick / password / blocked
			if (err.message !== 'Login Err') sweetMixinErrorAlert(err.message).then();
		} finally {
			setSubmitting(false);
		}
	};

	const cards = photos.length ? photos : ['/img/banner/hero.svg'];

	return (
		<Stack className={'admin-login'}>
			<Stack className={'login-hero'}>
				<span className={'orb orb-a'} />
				<span className={'orb orb-b'} />
				<span className={'orb orb-c'} />
				<span className={'grain'} />

				<Stack className={'hero-top'}>
					<img src={'/img/logo/logoWhite.svg'} alt={'modu'} />
					{now && (
						<span className={'clock'}>
							<i />
							{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</span>
					)}
				</Stack>

				<Stack className={'hero-copy'}>
					<span className={'greeting'}>{now ? greetingFor(now.getHours()) : ' '}</span>
					<h1>
						{headline.map((word, index) => (
							<span key={word} className={'word'} style={{ animationDelay: `${0.15 + index * 0.12}s` }}>
								{word}
							</span>
						))}
					</h1>
					<p className={'rotator'}>
						Check in on your{' '}
						<span className={'rotating'}>
							<span key={wordIndex} className={'rotating-word'}>
								{rotatingWords[wordIndex]}.
							</span>
						</span>
					</p>
				</Stack>

				<Stack className={`photo-stack count-${cards.length}`}>
					{cards.map((src, index) => (
						<div key={src} className={`photo photo-${index}`}>
							<img src={src} alt={''} />
						</div>
					))}
				</Stack>
			</Stack>

			<Stack className={'login-side'}>
				<form className={`admin-login-card ${shake ? 'shake' : ''}`} onSubmit={loginHandler}>
					<Stack className={'admin-login-brand'}>
						<img src={'/img/logo/logo.svg'} alt={'modu'} />
						<span>admin</span>
					</Stack>
					<h2>Sign in</h2>
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
					<Button
						type={'submit'}
						variant={'contained'}
						size={'large'}
						fullWidth
						disabled={submitting}
						className={'submit-btn'}
						endIcon={submitting ? <CircularProgress size={18} color={'inherit'} /> : <ArrowForwardRoundedIcon />}
					>
						Sign in
					</Button>
				</form>
			</Stack>
		</Stack>
	);
};

export default withAdminAuthLayout(AdminLogin);
