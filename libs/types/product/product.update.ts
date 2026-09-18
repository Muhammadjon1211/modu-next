import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductGender,
	ProductSeason,
	ProductSize,
	ProductStatus,
} from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productStatus?: ProductStatus;
	productCategory?: ProductCategory;
	productGender?: ProductGender;
	productBrand?: string;
	productTitle?: string;
	productPrice?: number;
	productDiscount?: number;
	productStock?: number;
	productSizes?: ProductSize[];
	productColors?: ProductColor[];
	productSeasons?: ProductSeason[];
	productFit?: ProductFit;
	productImages?: string[];
	productDesc?: string;
	productMaterial?: string;
	productTags?: string[];
	productFreeShipping?: boolean;
}
