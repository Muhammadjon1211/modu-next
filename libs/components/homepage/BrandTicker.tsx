import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@mui/material';
import { Product } from '../../types/product/product';

interface BrandTickerType {
	products: Product[];
}

const fallbackWords = ['Clothes', 'Accessories', 'New season', 'Sale'];

/** an endless band of the brands in the shop, in big outlined type */
const BrandTicker = (props: BrandTickerType) => {
	const { products } = props;
	const { t } = useTranslation('common');

	const brands = Array.from(new Set(products.map((ele) => ele.productBrand?.trim()).filter(Boolean)));
	// a short list is padded with the shop's own words so the band never looks sparse
	const words = [...brands, ...fallbackWords.map((ele) => t(ele))];
	// two identical halves: sliding by exactly one half loops without a seam
	const run = [...words, ...words];

	return (
		<Stack className={'brand-ticker'} aria-hidden={true}>
			<div className={'ticker-track'}>
				{[0, 1].map((half) => (
					<div key={half} className={'ticker-half'}>
						{run.map((word, index) => (
							<span key={`${half}-${index}`} className={index % 2 ? 'outlined' : ''}>
								{word}
								<i>✦</i>
							</span>
						))}
					</div>
				))}
			</div>
		</Stack>
	);
};

export default BrandTicker;
