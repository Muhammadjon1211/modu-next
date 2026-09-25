import { REACT_APP_API_URL } from './config';
import { formatPrice, salePrice } from './utils';
import { SeoProps } from './components/common/Seo';

/**
 * Server-side only (getServerSideProps). Inside docker the web container reaches the
 * API by its service name; everywhere else it falls back to the public GraphQL URL.
 */
const API_GRAPHQL_URL = process.env.INTERNAL_API_GRAPHQL_URL || process.env.REACT_APP_API_GRAPHQL_URL;

const PRODUCT_SEO_QUERY = `query ProductSeo($id: String!) {
	getProduct(productId: $id) {
		_id
		productTitle
		productBrand
		productPrice
		productDiscount
		productDesc
		productImages
		memberData { memberNick memberShopName }
	}
}`;

const truncate = (text: string, max: number) => {
	const clean = text.replace(/\s+/g, ' ').trim();
	return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

/** the link preview for one product — null when the id is bad or the API is slow, and the page falls back to site defaults */
export const fetchProductSeo = async (id: unknown): Promise<SeoProps | null> => {
	if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id) || !API_GRAPHQL_URL) return null;

	// a preview is never worth holding the page for
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 3000);
	try {
		const response = await fetch(API_GRAPHQL_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ query: PRODUCT_SEO_QUERY, variables: { id } }),
			signal: controller.signal,
		});
		const { data } = await response.json();
		const product = data?.getProduct;
		if (!product) return null;

		const price = salePrice(product.productPrice, product.productDiscount);
		const shop = product.memberData?.memberShopName || product.memberData?.memberNick;
		// "₩204,000 · Northwind Atelier" — price first, it is what a buyer scans for
		const lead = [formatPrice(price), product.productBrand, shop && shop !== product.productBrand ? shop : null]
			.filter(Boolean)
			.join(' · ');
		const image = product.productImages?.[0];

		return {
			title: product.productTitle,
			description: product.productDesc ? `${lead} — ${truncate(product.productDesc, 150)}` : lead,
			image: image ? `${REACT_APP_API_URL}/${image}` : undefined,
			path: `/product/detail?id=${product._id}`,
			type: 'product',
			price,
		};
	} catch (err: any) {
		console.log('fetchProductSeo:', err?.message);
		return null;
	} finally {
		clearTimeout(timer);
	}
};
