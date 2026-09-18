import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'modu, modu.uz, fashion, clothing, marketplace, 모두, 패션, мода, одежда'} />
				<meta
					name={'description'}
					content={
						'Shop clothes and accessories from independent shops on Modu. | ' +
						'모두에서 다양한 셀러의 의류와 액세서리를 만나보세요. | ' +
						'Одежда и аксессуары от независимых продавцов на Modu.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
