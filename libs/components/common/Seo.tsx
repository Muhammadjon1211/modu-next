import React from 'react';
import Head from 'next/head';

/** where the site is served from — link previews need absolute URLs */
export const SITE_URL = (process.env.REACT_APP_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = 'Modu';
export const DEFAULT_TITLE = 'Modu — clothes and accessories from independent shops';
export const DEFAULT_DESCRIPTION =
	'Shop clothes and accessories from independent shops on Modu — coats, dresses, shoes, bags, watches and more.';
/** a PNG on purpose: messengers skip SVG preview images */
export const DEFAULT_IMAGE = '/img/og/modu-og.png';

export interface SeoProps {
	title?: string;
	description?: string;
	/** absolute URL, or a path on this site */
	image?: string;
	/** path on this site, e.g. /product/detail?id=… */
	path?: string;
	type?: 'website' | 'product';
	/** product previews only */
	price?: number;
}

const absolute = (url: string) => (url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`);

/**
 * Title, description and the Open Graph / Twitter tags that messengers and social apps
 * read to draw a link preview. Every tag has a key, so a page's <Seo> replaces the
 * site defaults rendered in _app instead of duplicating them.
 */
const Seo = (props: SeoProps) => {
	const { title, description = DEFAULT_DESCRIPTION, image, path, type = 'website', price } = props;
	const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
	const imageUrl = absolute(image || DEFAULT_IMAGE);
	const url = path !== undefined ? absolute(path) : undefined;

	return (
		<Head>
			<title key={'title'}>{fullTitle}</title>
			<meta key={'description'} name={'description'} content={description} />

			<meta key={'og:site_name'} property={'og:site_name'} content={SITE_NAME} />
			<meta key={'og:type'} property={'og:type'} content={type} />
			<meta key={'og:title'} property={'og:title'} content={title ?? DEFAULT_TITLE} />
			<meta key={'og:description'} property={'og:description'} content={description} />
			<meta key={'og:image'} property={'og:image'} content={imageUrl} />
			<meta key={'og:image:alt'} property={'og:image:alt'} content={title ?? SITE_NAME} />
			{url && <meta key={'og:url'} property={'og:url'} content={url} />}
			{url && <link key={'canonical'} rel={'canonical'} href={url} />}

			<meta key={'twitter:card'} name={'twitter:card'} content={'summary_large_image'} />
			<meta key={'twitter:title'} name={'twitter:title'} content={title ?? DEFAULT_TITLE} />
			<meta key={'twitter:description'} name={'twitter:description'} content={description} />
			<meta key={'twitter:image'} name={'twitter:image'} content={imageUrl} />

			{price !== undefined && (
				<meta key={'product:price:amount'} property={'product:price:amount'} content={`${price}`} />
			)}
			{price !== undefined && (
				<meta key={'product:price:currency'} property={'product:price:currency'} content={'KRW'} />
			)}
		</Head>
	);
};

export default Seo;
