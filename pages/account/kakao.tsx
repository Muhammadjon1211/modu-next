import React, { useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { CircularProgress, Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { KAKAO_STATE_KEY, kakaoRedirectUri } from '../../libs/components/common/SocialLogin';
import { socialLogIn } from '../../libs/auth';
import { userVar } from '../../apollo/store';
import { MemberAuthType, MemberType } from '../../libs/enums/member.enum';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Kakao redirects here with ?code&state after the member approves */
const KakaoCallback: NextPage = () => {
	const router = useRouter();
	// an authorization code works once — strict mode's second effect run must not spend it again
	const started = useRef<boolean>(false);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady || started.current) return;
		started.current = true;

		const { code, state, error } = router.query as Record<string, string | undefined>;
		const saved = JSON.parse(sessionStorage.getItem(KAKAO_STATE_KEY) ?? '{}');
		sessionStorage.removeItem(KAKAO_STATE_KEY);
		const back = saved.back || '/';

		(async () => {
			try {
				if (error) throw new Error('cancelled'); // declined on Kakao's consent screen
				if (!code || !state || state !== saved.state) {
					await sweetMixinErrorAlert('Something went wrong!');
					throw new Error('state mismatch');
				}
				await socialLogIn({
					provider: MemberAuthType.KAKAO,
					credential: code,
					redirectUri: kakaoRedirectUri(),
					memberType: saved.memberType,
				});
				await router.replace(userVar().memberType === MemberType.ADMIN ? '/_admin' : back);
			} catch (err) {
				await router.replace({ pathname: '/account/join', query: saved.back ? { back: saved.back } : {} });
			}
		})();
	}, [router.isReady, router]);

	return (
		<Stack className={'loading-box'} sx={{ minHeight: '50vh' }}>
			<CircularProgress color={'inherit'} />
		</Stack>
	);
};

export default withLayoutBasic(KakaoCallback);
