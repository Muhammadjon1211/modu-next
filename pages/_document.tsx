import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />

				{/* description and link-preview tags come from <Seo>, per page */}
				<meta name="keywords" content={'modu, fashion, clothing, marketplace, 모두, 패션, мода, одежда'} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
