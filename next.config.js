/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
	},
	i18n,
	// "Sellers" became "Shops" — old links still land on the right page
	async redirects() {
		return [
			{ source: '/seller', destination: '/shop', permanent: true },
			{ source: '/_admin/stores', destination: '/_admin/shops', permanent: true },
			{ source: '/_admin/stores/detail', destination: '/_admin/shops/detail', permanent: true },
		];
	},
};

module.exports = nextConfig;
