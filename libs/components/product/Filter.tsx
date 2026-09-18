import React, { MouseEvent, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button, Checkbox, FormControlLabel, Popover, Slider, Stack, Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
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

type Panel = 'category' | 'gender' | 'size' | 'color' | 'price' | 'rating' | 'more';

const toggle = <E,>(list: E[] | undefined, value: E): E[] | undefined => {
	const next = list?.includes(value) ? list.filter((ele) => ele !== value) : [...(list ?? []), value];
	return next.length ? next : undefined;
};

/**
 * One horizontal row of filters that stays under the header. It only ever scrolls sideways;
 * each button opens its options in a popover, so the row itself never grows taller.
 */
const Filter = (props: FilterType) => {
	const { searchFilter, initialInput } = props;
	const router = useRouter();
	const { t } = useTranslation('common');
	const search = searchFilter.search;
	const [anchor, setAnchor] = useState<{ el: HTMLElement; panel: Panel } | null>(null);
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

	const openHandler = (e: MouseEvent<HTMLElement>, panel: Panel) => setAnchor({ el: e.currentTarget, panel });

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
		setAnchor(null);
		await router.push(
			`/product?input=${JSON.stringify({ ...initialInput, search: { text: search.text } })}`,
			`/product?input=${JSON.stringify({ ...initialInput, search: { text: search.text } })}`,
			{ scroll: false },
		);
	};

	const moreCount = (search.options?.length ?? 0) + (search.inStockOnly ? 1 : 0);
	const counts: Record<Panel, number> = {
		category: search.categoryList?.length ?? 0,
		gender: search.genderList?.length ?? 0,
		size: search.sizeList?.length ?? 0,
		color: search.colorList?.length ?? 0,
		price: search.pricesRange ? 1 : 0,
		rating: search.ratingFrom ? 1 : 0,
		more: moreCount,
	};
	const anyActive = !!search.group || Object.values(counts).some((ele) => ele > 0);

	const chip = (panel: Panel, label: string) => (
		<button
			key={panel}
			className={`filter-chip ${counts[panel] ? 'active' : ''} ${anchor?.panel === panel ? 'open' : ''}`}
			onClick={(e) => openHandler(e, panel)}
		>
			{t(label)}
			{counts[panel] > 0 && panel !== 'price' && panel !== 'rating' && <em>{counts[panel]}</em>}
			{panel === 'price' && search.pricesRange && <em>{formatPrice(search.pricesRange.start)}+</em>}
			{panel === 'rating' && search.ratingFrom && <em>{search.ratingFrom}+</em>}
			<KeyboardArrowDownRoundedIcon />
		</button>
	);

	const panels: Record<Panel, ReactNode> = {
		category: (
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
		),
		gender: (
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
		),
		size: (
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
		),
		color: (
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
		),
		price: (
			<Stack className={'price-panel'}>
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
		),
		rating: (
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
		),
		more: (
			<Stack className={'category-list'}>
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
		),
	};

	return (
		<Stack className={'filter-bar'}>
			<Stack className={'filter-row'}>
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
				{chip('category', 'Category')}
				{chip('gender', 'Gender')}
				{chip('size', 'Size')}
				{chip('color', 'Color')}
				{chip('price', 'Price')}
				{chip('rating', 'Rating')}
				{chip('more', 'More')}
				{anyActive && (
					<Button size={'small'} className={'reset-btn'} onClick={resetHandler}>
						{t('Reset')}
					</Button>
				)}
			</Stack>
			<Popover
				open={!!anchor}
				anchorEl={anchor?.el}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				className={'filter-popover'}
				disableScrollLock
			>
				{anchor && <Stack className={`filter-panel ${anchor.panel}`}>{panels[anchor.panel]}</Stack>}
			</Popover>
		</Stack>
	);
};

export default Filter;
