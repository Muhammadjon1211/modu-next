import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductGender,
	ProductGroup,
	ProductSeason,
	ProductSize,
} from './enums/product.enum';
import { BoardArticleCategory } from './enums/board-article.enum';
import { ReturnReason } from './enums/return.enum';

export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const CURRENCY = '₩';
export const DELIVERY_FEE = 3000;
export const RETURN_WINDOW_DAYS = 3;
export const PRICE_MAX = 500000;

/** mirrors the backend taxonomy — a leaf category always resolves to one group */
export const categoryGroupMap: Record<ProductCategory, ProductGroup> = {
	[ProductCategory.TOP]: ProductGroup.CLOTHES,
	[ProductCategory.BOTTOM]: ProductGroup.CLOTHES,
	[ProductCategory.OUTERWEAR]: ProductGroup.CLOTHES,
	[ProductCategory.DRESS]: ProductGroup.CLOTHES,
	[ProductCategory.ACTIVEWEAR]: ProductGroup.CLOTHES,
	[ProductCategory.UNDERWEAR]: ProductGroup.CLOTHES,
	[ProductCategory.SHOES]: ProductGroup.CLOTHES,
	[ProductCategory.BAG]: ProductGroup.ACCESSORIES,
	[ProductCategory.HAT]: ProductGroup.ACCESSORIES,
	[ProductCategory.BELT]: ProductGroup.ACCESSORIES,
	[ProductCategory.JEWELRY]: ProductGroup.ACCESSORIES,
	[ProductCategory.SCARF]: ProductGroup.ACCESSORIES,
	[ProductCategory.SUNGLASSES]: ProductGroup.ACCESSORIES,
	[ProductCategory.OTHER_ACCESSORY]: ProductGroup.ACCESSORIES,
};

export const categoriesOf = (group?: ProductGroup): ProductCategory[] =>
	Object.values(ProductCategory).filter((ele) => !group || categoryGroupMap[ele] === group);

export const categoryLabels: Record<ProductCategory, string> = {
	[ProductCategory.TOP]: 'Tops',
	[ProductCategory.BOTTOM]: 'Bottoms',
	[ProductCategory.OUTERWEAR]: 'Outerwear',
	[ProductCategory.DRESS]: 'Dresses',
	[ProductCategory.ACTIVEWEAR]: 'Activewear',
	[ProductCategory.UNDERWEAR]: 'Underwear',
	[ProductCategory.SHOES]: 'Shoes',
	[ProductCategory.BAG]: 'Bags',
	[ProductCategory.HAT]: 'Hats',
	[ProductCategory.BELT]: 'Belts',
	[ProductCategory.JEWELRY]: 'Jewelry',
	[ProductCategory.SCARF]: 'Scarves',
	[ProductCategory.SUNGLASSES]: 'Sunglasses',
	[ProductCategory.OTHER_ACCESSORY]: 'Other',
};

export const groupLabels: Record<ProductGroup, string> = {
	[ProductGroup.CLOTHES]: 'Clothes',
	[ProductGroup.ACCESSORIES]: 'Accessories',
};

export const genderLabels: Record<ProductGender, string> = {
	[ProductGender.MEN]: 'Men',
	[ProductGender.WOMEN]: 'Women',
	[ProductGender.UNISEX]: 'Unisex',
	[ProductGender.KIDS]: 'Kids',
};

export const seasonLabels: Record<ProductSeason, string> = {
	[ProductSeason.SPRING]: 'Spring',
	[ProductSeason.SUMMER]: 'Summer',
	[ProductSeason.AUTUMN]: 'Autumn',
	[ProductSeason.WINTER]: 'Winter',
	[ProductSeason.ALL_SEASON]: 'All season',
};

export const fitLabels: Record<ProductFit, string> = {
	[ProductFit.SLIM]: 'Slim',
	[ProductFit.REGULAR]: 'Regular',
	[ProductFit.OVERSIZE]: 'Oversize',
};

export const productSizes: ProductSize[] = Object.values(ProductSize);

export const colorHex: Record<ProductColor, string> = {
	[ProductColor.BLACK]: '#111111',
	[ProductColor.WHITE]: '#ffffff',
	[ProductColor.GREY]: '#9e9e9e',
	[ProductColor.BEIGE]: '#e8dcc4',
	[ProductColor.BROWN]: '#7b5236',
	[ProductColor.RED]: '#d93a2b',
	[ProductColor.PINK]: '#f4a6c0',
	[ProductColor.ORANGE]: '#f28c28',
	[ProductColor.YELLOW]: '#f5d547',
	[ProductColor.GREEN]: '#4f8a55',
	[ProductColor.BLUE]: '#3a6fd8',
	[ProductColor.NAVY]: '#1f2a4d',
	[ProductColor.PURPLE]: '#7a4fbf',
	[ProductColor.MULTI]: 'conic-gradient(#d93a2b, #f5d547, #4f8a55, #3a6fd8, #7a4fbf, #d93a2b)',
};

/** boolean facets — productNew has no backing field yet, so it is left out */
export const availableOptions = ['productOnSale', 'productFreeShipping'];

export const optionLabels: Record<string, string> = {
	productOnSale: 'On sale',
	productFreeShipping: 'Free shipping',
};

export const productSortOptions = [
	{ label: 'Newest', sort: 'createdAt', direction: 'DESC' },
	{ label: 'Popular', sort: 'productViews', direction: 'DESC' },
	{ label: 'Best selling', sort: 'productSales', direction: 'DESC' },
	{ label: 'Top rated', sort: 'productRating', direction: 'DESC' },
	{ label: 'Price: low to high', sort: 'productPrice', direction: 'ASC' },
	{ label: 'Price: high to low', sort: 'productPrice', direction: 'DESC' },
];

export const sellerSortOptions = [
	{ label: 'Top', sort: 'memberRank', direction: 'DESC' },
	{ label: 'Most liked', sort: 'memberLikes', direction: 'DESC' },
	{ label: 'Most viewed', sort: 'memberViews', direction: 'DESC' },
	{ label: 'Newest', sort: 'createdAt', direction: 'DESC' },
];

export const articleCategoryLabels: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.LOOKBOOK]: 'Lookbook',
	[BoardArticleCategory.STYLE_TIP]: 'Style tips',
	[BoardArticleCategory.NEWS]: 'News',
	[BoardArticleCategory.Q_AND_A]: 'Q&A',
};

export const returnReasonLabels: Record<ReturnReason, string> = {
	[ReturnReason.DEFECTIVE]: 'Defective',
	[ReturnReason.WRONG_ITEM]: 'Wrong item',
	[ReturnReason.WRONG_SIZE]: 'Wrong size',
	[ReturnReason.NOT_AS_DESCRIBED]: 'Not as described',
	[ReturnReason.CHANGED_MIND]: 'Changed my mind',
	[ReturnReason.OTHER]: 'Other',
};

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};
