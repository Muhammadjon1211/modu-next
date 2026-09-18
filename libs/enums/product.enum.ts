export enum ProductStatus {
	ACTIVE = 'ACTIVE',
	SOLD_OUT = 'SOLD_OUT',
	DELETE = 'DELETE',
}

/** The two top-level catalog tabs. Derived from the category — never picked directly. */
export enum ProductGroup {
	CLOTHES = 'CLOTHES',
	ACCESSORIES = 'ACCESSORIES',
}

export enum ProductCategory {
	/** group: CLOTHES */
	TOP = 'TOP',
	BOTTOM = 'BOTTOM',
	OUTERWEAR = 'OUTERWEAR',
	DRESS = 'DRESS',
	ACTIVEWEAR = 'ACTIVEWEAR',
	UNDERWEAR = 'UNDERWEAR',
	SHOES = 'SHOES',
	/** group: ACCESSORIES */
	BAG = 'BAG',
	HAT = 'HAT',
	BELT = 'BELT',
	JEWELRY = 'JEWELRY',
	SCARF = 'SCARF',
	SUNGLASSES = 'SUNGLASSES',
	OTHER_ACCESSORY = 'OTHER_ACCESSORY',
}

export enum ProductGender {
	MEN = 'MEN',
	WOMEN = 'WOMEN',
	UNISEX = 'UNISEX',
	KIDS = 'KIDS',
}

export enum ProductSize {
	XS = 'XS',
	S = 'S',
	M = 'M',
	L = 'L',
	XL = 'XL',
	XXL = 'XXL',
	FREE = 'FREE',
}

export enum ProductColor {
	BLACK = 'BLACK',
	WHITE = 'WHITE',
	GREY = 'GREY',
	BEIGE = 'BEIGE',
	BROWN = 'BROWN',
	RED = 'RED',
	PINK = 'PINK',
	ORANGE = 'ORANGE',
	YELLOW = 'YELLOW',
	GREEN = 'GREEN',
	BLUE = 'BLUE',
	NAVY = 'NAVY',
	PURPLE = 'PURPLE',
	MULTI = 'MULTI',
}

export enum ProductSeason {
	SPRING = 'SPRING',
	SUMMER = 'SUMMER',
	AUTUMN = 'AUTUMN',
	WINTER = 'WINTER',
	ALL_SEASON = 'ALL_SEASON',
}

export enum ProductFit {
	SLIM = 'SLIM',
	REGULAR = 'REGULAR',
	OVERSIZE = 'OVERSIZE',
}
