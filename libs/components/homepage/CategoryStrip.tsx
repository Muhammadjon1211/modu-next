import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Stack } from '@mui/material';
import { ProductCategory } from '../../enums/product.enum';
import { categoryLabels } from '../../config';

const featured: ProductCategory[] = [
	ProductCategory.TOP,
	ProductCategory.BOTTOM,
	ProductCategory.OUTERWEAR,
	ProductCategory.DRESS,
	ProductCategory.SHOES,
	ProductCategory.BAG,
	ProductCategory.HAT,
	ProductCategory.JEWELRY,
];

const CategoryStrip = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'category-strip'}>
			<Stack className={'container'}>
				{featured.map((category) => {
					const input = {
						page: 1,
						limit: 12,
						sort: 'createdAt',
						direction: 'DESC',
						search: { categoryList: [category] },
					};
					return (
						<Link key={category} href={`/product?input=${JSON.stringify(input)}`} className={'category-item'}>
							<span className={'category-icon'}>
								<img src={`/img/icons/category/${category.toLowerCase()}.svg`} alt={''} />
							</span>
							<span>{t(categoryLabels[category])}</span>
						</Link>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default CategoryStrip;
