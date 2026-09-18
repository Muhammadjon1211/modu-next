import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductGender,
	ProductGroup,
	ProductSeason,
	ProductSize,
	ProductStatus,
} from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';
import { Range } from '../common';

export interface ProductInput {
	productCategory: ProductCategory;
	productGender: ProductGender;
	productBrand: string;
	productTitle: string;
	productPrice: number;
	productDiscount?: number;
	productStock: number;
	productSizes: ProductSize[];
	productColors: ProductColor[];
	productSeasons?: ProductSeason[];
	productFit?: ProductFit;
	productImages: string[];
	productDesc?: string;
	productMaterial?: string;
	productTags?: string[];
	productFreeShipping?: boolean;
}

interface PISearch {
	memberId?: string;
	group?: ProductGroup;
	categoryList?: ProductCategory[];
	sizeList?: ProductSize[];
	colorList?: ProductColor[];
	genderList?: ProductGender[];
	seasonList?: ProductSeason[];
	fitList?: ProductFit[];
	options?: string[];
	pricesRange?: Range;
	ratingFrom?: number;
	inStockOnly?: boolean;
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface SPISearch {
	productStatus?: ProductStatus;
	categoryList?: ProductCategory[];
	text?: string;
}

export interface SellerProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: SPISearch;
}

interface ALPISearch {
	memberId?: string;
	productStatus?: ProductStatus;
	categoryList?: ProductCategory[];
	text?: string;
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}
