import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button, Checkbox, FormControlLabel, Slider, Stack, Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { ProductsInquiry } from '../../types/product/product.input';
import { ProductCategory, ProductColor, ProductGender, ProductGroup, ProductSize } from '../../enums/product.enum';
import {
	availableOptions,
	categoriesOf,
	categoryLabels,
	colorHex,
	genderLabels,
	groupLabels,
	optionLabels,
	PRICE_MAX,
	productSizes,
} from '../../config';
import { formatPrice } from '../../utils';

interface FilterType {
	searchFilter: ProductsInquiry;
	initialInput: ProductsInquiry;
}

const toggle = <E,>(list: E[] | undefined, value: E): E[] | undefined => {
	const next = list?.includes(value) ? list.filter((ele) => ele !== value) : [...(list ?? []), value];
	return next.length ? next : undefined;
};

const Filter = (props: FilterType) => {
	const { searchFilter, initialInput } = props;
	const router = useRouter();
	const { t } = useTranslation('common');
	const search = searchFilter.search;
	const [price, setPrice] = useState<number[]>([
		search?.pricesRange?.start ?? 0,
		search?.pricesRange?.end ?? PRICE_MAX,
	]);

	/** LIFECYCLES **/
	useEffect(() => {
		setPrice([search?.pricesRange?.start ?? 0, search?.pricesRange?.end ?? PRICE_MAX]);
	}, [search?.pricesRange?.start, search?.pricesRange?.end]);

	/** HANDLERS **/
	const pushSearchHandler = async (nextSearch: ProductsInquiry['search']) => {
		const cleaned = Object.fromEntries(Object.entries(nextSearch).filter(([, value]) => value !== undefined));
		const input = { ...searchFilter, page: 1, search: cleaned };
		await router.push(`/product?input=${JSON.stringify(input)}`, `/product?input=${JSON.stringify(input)}`, {
			scroll: false,
		});
	};

	const groupHandler = (group?: ProductGroup) => {
		const categoryList = search.categoryList?.filter((ele) => categoriesOf(group).includes(ele));
		pushSearchHandler({ ...search, group, categoryList: categoryList?.length ? categoryList : undefined }).then();
	};

	const categoryHandler = (category: ProductCategory) => {
		pushSearchHandler({ ...search, categoryList: toggle(search.categoryList, category) }).then();
	};

	const genderHandler = (gender: ProductGender) => {
		pushSearchHandler({ ...search, genderList: toggle(search.genderList, gender) }).then();
	};

	const sizeHandler = (size: ProductSize) => {
		pushSearchHandler({ ...search, sizeList: toggle(search.sizeList, size) }).then();
	};

	const colorHandler = (color: ProductColor) => {
		pushSearchHandler({ ...search, colorList: toggle(search.colorList, color) }).then();
	};

	const optionHandler = (option: string) => {
		pushSearchHandler({ ...search, options: toggle(search.options, option) }).then();
	};

	const inStockHandler = () => {
		pushSearchHandler({ ...search, inStockOnly: search.inStockOnly ? undefined : true }).then();
	};

	const ratingHandler = (rating: number) => {
		pushSearchHandler({ ...search, ratingFrom: search.ratingFrom === rating ? undefined : rating }).then();
	};

	const priceCommitHandler = (value: number[]) => {
		const isFull = value[0] === 0 && value[1] === PRICE_MAX;
		pushSearchHandler({ ...search, pricesRange: isFull ? undefined : { start: value[0], end: value[1] } }).then();
	};

	const resetHandler = async () => {
		await router.push(
			`/product?input=${JSON.stringify(initialInput)}`,
			`/product?input=${JSON.stringify(initialInput)}`,
			{ scroll: false },
		);
	};

	return (
		<Stack className={'filter-config'}>
			<Stack className={'filter-head'}>
				<h3>{t('Filters')}</h3>
				<Button size={'small'} onClick={resetHandler}>
					{t('Reset')}
				</Button>
			</Stack>

			<Stack className={'find-your-group'}>
				<Stack className={'segment'}>
					<button className={!search.group ? 'active' : ''} onClick={() => groupHandler(undefined)}>
						{t('All')}
					</button>
					{Object.values(ProductGroup).map((group) => (
						<button key={group} className={search.group === group ? 'active' : ''} onClick={() => groupHandler(group)}>
							{t(groupLabels[group])}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				<h4>{t('Category')}</h4>
				<Stack className={'category-list'}>
					{categoriesOf(search.group).map((category) => (
						<FormControlLabel
							key={category}
							control={
								<Checkbox
									size={'small'}
									checked={!!search.categoryList?.includes(category)}
									onChange={() => categoryHandler(category)}
								/>
							}
							label={t(categoryLabels[category])}
						/>
					))}
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				<h4>{t('Gender')}</h4>
				<Stack className={'chip-list'}>
					{Object.values(ProductGender).map((gender) => (
						<button
							key={gender}
							className={`chip ${search.genderList?.includes(gender) ? 'active' : ''}`}
							onClick={() => genderHandler(gender)}
						>
							{t(genderLabels[gender])}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				<h4>{t('Size')}</h4>
				<Stack className={'size-list'}>
					{productSizes.map((size) => (
						<button
							key={size}
							className={`size ${search.sizeList?.includes(size) ? 'active' : ''}`}
							onClick={() => sizeHandler(size)}
						>
							{size}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				<h4>{t('Color')}</h4>
				<Stack className={'color-list'}>
					{Object.values(ProductColor).map((color) => (
						<Tooltip key={color} title={t(color)} placement={'top'}>
							<button
								className={`swatch ${search.colorList?.includes(color) ? 'active' : ''} ${color.toLowerCase()}`}
								style={{ background: colorHex[color] }}
								onClick={() => colorHandler(color)}
								aria-label={color}
							>
								{search.colorList?.includes(color) && <CheckRoundedIcon />}
							</button>
						</Tooltip>
					))}
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				<h4>{t('Price')}</h4>
				<Slider
					value={price}
					min={0}
					max={PRICE_MAX}
					step={5000}
					onChange={(e, value) => setPrice(value as number[])}
					onChangeCommitted={(e, value) => priceCommitHandler(value as number[])}
					disableSwap
				/>
				<Stack className={'price-values'}>
					<span>{formatPrice(price[0])}</span>
					<span>
						{formatPrice(price[1])}
						{price[1] === PRICE_MAX ? '+' : ''}
					</span>
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				<h4>{t('Rating')}</h4>
				<Stack className={'chip-list'}>
					{[4, 3].map((rating) => (
						<button
							key={rating}
							className={`chip ${search.ratingFrom === rating ? 'active' : ''}`}
							onClick={() => ratingHandler(rating)}
						>
							<StarRoundedIcon /> {rating}+
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'filter-block'}>
				{availableOptions.map((option) => (
					<FormControlLabel
						key={option}
						control={
							<Checkbox
								size={'small'}
								checked={!!search.options?.includes(option)}
								onChange={() => optionHandler(option)}
							/>
						}
						label={t(optionLabels[option])}
					/>
				))}
				<FormControlLabel
					control={<Checkbox size={'small'} checked={!!search.inStockOnly} onChange={inStockHandler} />}
					label={t('In stock')}
				/>
			</Stack>
		</Stack>
	);
};

export default Filter;
