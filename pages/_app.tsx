import type { AppProps } from 'next/app';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { appWithTranslation } from 'next-i18next';
import { useApollo } from '../apollo/client';
import { navDepthVar } from '../apollo/store';
import { light } from '../scss/MaterialTheme';
import Seo from '../libs/components/common/Seo';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	const router = useRouter();

	// counts in-app navigations so a back button knows whether history.back() stays on the site
	useEffect(() => {
		const countHandler = () => navDepthVar(navDepthVar() + 1);
		router.events.on('routeChangeComplete', countHandler);
		return () => router.events.off('routeChangeComplete', countHandler);
	}, [router.events]);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{/* site-wide link preview; a page's own <Seo> replaces these tag by tag */}
				<Seo path={router.asPath} />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
