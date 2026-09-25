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
import { MeLiked, Member, TotalCounter } from '../member/member';

export interface Product {
	_id: string;
	productCategory: ProductCategory;
	productGroup: ProductGroup;
	productStatus: ProductStatus;
	productGender: ProductGender;
	productBrand: string;
	productTitle: string;
	productPrice: number;
	productDiscount: number;
	productStock: number;
	productSizes: ProductSize[];
	productColors: ProductColor[];
	productSeasons?: ProductSeason[];
	productFit?: ProductFit;
	productImages: string[];
	productDesc?: string;
	productMaterial?: string;
	productTags?: string[];
	productOnSale: boolean;
	productFreeShipping: boolean;
	productViews: number;
	productLikes: number;
	productComments: number;
	productSales: number;
	productRating: number;
	productRatingCount: number;
	productRank: number;
	memberId: string;
	soldOutAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	memberData?: Member;
	meLiked?: MeLiked[];
	meRecommended?: boolean;
}

export interface Recommendations {
	list: Product[];
	personalized: boolean;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
