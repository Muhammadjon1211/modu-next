import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Button, Stack } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import { GET_AUTH_PROVIDERS } from '../../../apollo/user/query';
import { socialLogIn } from '../../auth';
import { MemberAuthType } from '../../enums/member.enum';
import { T } from '../../types/common';

/** where Kakao sends the browser back; must be registered in Kakao Developers exactly as written */
export const kakaoRedirectUri = (): string => `${window.location.origin}/account/kakao`;
/** what the Kakao round trip needs to remember across the full-page redirect */
export const KAKAO_STATE_KEY = 'kakaoAuth';

const loadScript = (src: string): Promise<void> =>
	new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
		if (existing?.dataset.loaded) return resolve();
		const script = existing ?? document.createElement('script');
		script.addEventListener('load', () => {
			script.dataset.loaded = 'true';
			resolve();
		});
		script.addEventListener('error', () => reject(new Error(`failed to load ${src}`)));
		if (!existing) {
			script.src = src;
			script.async = true;
			document.head.appendChild(script);
		}
	});

interface SocialLoginProps {
	/** set on the sign-up tab; only used when the login creates the account */
	memberType?: string;
	onSuccess: () => void;
}

const SocialLogin = ({ memberType, onSuccess }: SocialLoginProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const googleRef = useRef<HTMLDivElement>(null);
	// Google's callback is registered once, so it reads the latest props through refs
	const memberTypeRef = useRef(memberType);
	const onSuccessRef = useRef(onSuccess);
	memberTypeRef.current = memberType;
	onSuccessRef.current = onSuccess;

	/** APOLLO REQUESTS **/
	const { data } = useQuery(GET_AUTH_PROVIDERS, { fetchPolicy: 'cache-first' });
	const providers: T = data?.getAuthProviders ?? {};
	const { googleClientId, kakaoClientId, telegramBotId } = providers;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!googleClientId) return;
		let cancelled = false;
		const googleLocale = router.locale === 'kr' ? 'ko' : (router.locale ?? 'en');
		// the button follows the browser's language unless the script itself is told otherwise
		loadScript(`https://accounts.google.com/gsi/client?hl=${googleLocale}`)
			.then(() => {
				const google = (window as any).google;
				if (cancelled || !googleRef.current || !google) return;
				google.accounts.id.initialize({
					client_id: googleClientId,
					callback: (response: { credential: string }) => {
						socialLogIn({
							provider: MemberAuthType.GOOGLE,
							credential: response.credential,
							memberType: memberTypeRef.current,
						})
							.then(() => onSuccessRef.current())
							.catch(() => {});
					},
				});
				google.accounts.id.renderButton(googleRef.current, {
					theme: 'outline',
					size: 'large',
					shape: 'pill',
					text: 'continue_with',
					logo_alignment: 'center',
					width: Math.min(googleRef.current.offsetWidth || 400, 400),
					locale: googleLocale,
				});
			})
			.catch((err) => console.log('ERROR, google script:', err.message));
		return () => {
			cancelled = true;
		};
	}, [googleClientId, router.locale]);

	/** HANDLERS **/
	const kakaoHandler = () => {
		const state = crypto.getRandomValues(new Uint32Array(4)).join('');
		sessionStorage.setItem(
			KAKAO_STATE_KEY,
			JSON.stringify({ state, memberType, back: (router.query?.back as string) ?? '' }),
		);
		const params = new URLSearchParams({
			response_type: 'code',
			client_id: kakaoClientId,
			redirect_uri: kakaoRedirectUri(),
			state,
		});
		window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
	};

	const telegramHandler = async () => {
		try {
			await loadScript('https://telegram.org/js/telegram-widget.js?22');
			(window as any).Telegram.Login.auth({ bot_id: telegramBotId }, (user: T | false) => {
				if (!user) return; // closed the popup
				socialLogIn({
					provider: MemberAuthType.TELEGRAM,
					credential: JSON.stringify(user),
					memberType,
				})
					.then(() => onSuccess())
					.catch(() => {});
			});
		} catch (err: any) {
			console.log('ERROR, telegramHandler:', err.message);
		}
	};

	if (!googleClientId && !kakaoClientId && !telegramBotId) return null;

	return (
		<Stack className={'social-login'}>
			<div className={'social-divider'}>
				<span>{t('or')}</span>
			</div>
			{googleClientId && <div className={'google-button'} ref={googleRef} />}
			{kakaoClientId && (
				<Button className={'social-button kakao'} onClick={kakaoHandler} fullWidth>
					<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12 3C6.48 3 2 6.48 2 10.77c0 2.77 1.86 5.2 4.66 6.57-.15.52-.97 3.36-1 3.58 0 0-.02.17.09.23.11.07.24.02.24.02.32-.05 3.7-2.42 4.29-2.84.56.08 1.13.12 1.72.12 5.52 0 10-3.48 10-7.68C22 6.48 17.52 3 12 3z"
						/>
					</svg>
					{t('Continue with Kakao')}
				</Button>
			)}
			{telegramBotId && (
				<Button className={'social-button telegram'} onClick={telegramHandler} fullWidth>
					<TelegramIcon fontSize={'small'} />
					{t('Continue with Telegram')}
				</Button>
			)}
		</Stack>
	);
};

export default SocialLogin;
