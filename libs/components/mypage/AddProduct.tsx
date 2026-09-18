import React, { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import {
	Button,
	CircularProgress,
	FormControlLabel,
	IconButton,
	InputAdornment,
	ListSubheader,
	MenuItem,
	Stack,
	Switch,
	TextField,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { CREATE_PRODUCT, IMAGES_UPLOADER, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { ProductInput } from '../../types/product/product.input';
import {
	ProductCategory,
	ProductColor,
	ProductFit,
	ProductGender,
	ProductGroup,
	ProductSeason,
	ProductSize,
} from '../../enums/product.enum';
import {
	categoriesOf,
	categoryLabels,
	colorHex,
	CURRENCY,
	fitLabels,
	genderLabels,
	groupLabels,
	productSizes,
	seasonLabels,
} from '../../config';
import { getImageUrl, imageFallbackHandler, prepareImages } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const MAX_IMAGES = 10;

interface ProductForm {
	productCategory: ProductCategory | '';
	productGender: ProductGender | '';
	productBrand: string;
	productTitle: string;
	productPrice: string;
	productDiscount: string;
	productStock: string;
	productSizes: ProductSize[];
	productColors: ProductColor[];
	productSeasons: ProductSeason[];
	productFit: ProductFit | '';
	productImages: string[];
	productDesc: string;
	productMaterial: string;
	productTags: string;
	productFreeShipping: boolean;
}

const emptyForm: ProductForm = {
	productCategory: '',
	productGender: '',
	productBrand: '',
	productTitle: '',
	productPrice: '',
	productDiscount: '',
	productStock: '',
	productSizes: [],
	productColors: [],
	productSeasons: [],
	productFit: '',
	productImages: [],
	productDesc: '',
	productMaterial: '',
	productTags: '',
	productFreeShipping: false,
};

const toggle = <E,>(list: E[], value: E): E[] =>
	list.includes(value) ? list.filter((ele) => ele !== value) : [...list, value];

const AddProduct = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const productId = (router.query?.productId as string) ?? '';
	const [form, setForm] = useState<ProductForm>(emptyForm);
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);
	const [imagesUploader] = useMutation(IMAGES_UPLOADER);

	const { loading } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: productId },
		skip: !productId,
		onCompleted: (data: T) => {
			const product = data?.getProduct;
			if (!product) return;
			setForm({
				productCategory: product.productCategory,
				productGender: product.productGender,
				productBrand: product.productBrand,
				productTitle: product.productTitle,
				productPrice: String(product.productPrice),
				productDiscount: product.productDiscount ? String(product.productDiscount) : '',
				productStock: String(product.productStock),
				productSizes: product.productSizes ?? [],
				productColors: product.productColors ?? [],
				productSeasons: product.productSeasons ?? [],
				productFit: product.productFit ?? '',
				productImages: product.productImages ?? [],
				productDesc: product.productDesc ?? '',
				productMaterial: product.productMaterial ?? '',
				productTags: (product.productTags ?? []).join(', '),
				productFreeShipping: !!product.productFreeShipping,
			});
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!productId) setForm(emptyForm);
	}, [productId]);

	/** HANDLERS **/
	const changeHandler = <K extends keyof ProductForm>(name: K, value: ProductForm[K]) => {
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const uploadImagesHandler = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			const files = e.target.files;
			if (!files?.length) return;
			const room = MAX_IMAGES - form.productImages.length;
			if (room <= 0) throw new Error(t('Up to 10 images'));
			const prepared = await prepareImages(Array.from(files).slice(0, room));

			setUploading(true);
			const { data } = await imagesUploader({ variables: { files: prepared, target: 'product' } });
			setForm((prev) => ({ ...prev, productImages: [...prev.productImages, ...(data?.imagesUploader ?? [])] }));
		} catch (err: any) {
			console.log('ERROR, uploadImagesHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setUploading(false);
			e.target.value = '';
		}
	};

	const removeImageHandler = (index: number) => {
		setForm((prev) => ({ ...prev, productImages: prev.productImages.filter((_, i) => i !== index) }));
	};

	const makeCoverHandler = (index: number) => {
		setForm((prev) => {
			const images = [...prev.productImages];
			const [cover] = images.splice(index, 1);
			return { ...prev, productImages: [cover, ...images] };
		});
	};

	const buildInput = (): ProductInput => {
		const price = Number(form.productPrice);
		const stock = Number(form.productStock);
		const discount = form.productDiscount ? Number(form.productDiscount) : 0;

		if (!form.productCategory || !form.productGender) throw new Error(t('Please fulfill all inputs!'));
		if (form.productBrand.trim().length < 2 || form.productTitle.trim().length < 3)
			throw new Error(t('Please fulfill all inputs!'));
		if (!form.productPrice || Number.isNaN(price) || price < 0) throw new Error(t('Check the price'));
		if (form.productStock === '' || !Number.isInteger(stock) || stock < 0) throw new Error(t('Check the stock'));
		if (!Number.isInteger(discount) || discount < 0 || discount > 99)
			throw new Error('Discount must be between 0 and 99 percent!');
		if (!form.productSizes.length || !form.productColors.length) throw new Error(t('Pick sizes and colors'));
		if (!form.productImages.length) throw new Error(t('Add at least one image'));
		if (form.productDesc && form.productDesc.trim().length < 5) throw new Error(t('Description is too short'));

		const input: T = {
			productCategory: form.productCategory,
			productGender: form.productGender,
			productBrand: form.productBrand.trim(),
			productTitle: form.productTitle.trim(),
			productPrice: price,
			productDiscount: discount,
			productStock: stock,
			productSizes: form.productSizes,
			productColors: form.productColors,
			productSeasons: form.productSeasons,
			productImages: form.productImages,
			productFreeShipping: form.productFreeShipping,
			productTags: form.productTags
				.split(',')
				.map((ele) => ele.trim())
				.filter((ele) => ele),
		};
		if (form.productFit) input.productFit = form.productFit;
		if (form.productDesc.trim()) input.productDesc = form.productDesc.trim();
		if (form.productMaterial.trim()) input.productMaterial = form.productMaterial.trim();
		return input as ProductInput;
	};

	const submitHandler = async () => {
		try {
			const input = buildInput();
			setSaving(true);
			if (productId) {
				await updateProduct({ variables: { input: { _id: productId, ...input } } });
			} else {
				await createProduct({ variables: { input } });
			}
			await sweetTopSuccessAlert(productId ? t('Saved') : t('Product added'), 1200);
			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			console.log('ERROR, submitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSaving(false);
		}
	};

	if (productId && loading) {
		return (
			<Stack className={'loading-box'}>
				<CircularProgress color={'inherit'} />
			</Stack>
		);
	}

	return (
		<Stack className={'add-product'}>
			<h2 className={'my-title'}>{productId ? t('Edit product') : t('Add product')}</h2>

			<Stack className={'form-section'}>
				<Stack className={'image-grid'}>
					{form.productImages.map((image, index) => (
						<Stack key={`${image}-${index}`} className={`image-slot ${index === 0 ? 'cover' : ''}`}>
							<img src={getImageUrl(image)} alt={''} onError={imageFallbackHandler()} />
							{index === 0 ? (
								<span className={'cover-tag'}>{t('Cover')}</span>
							) : (
								<button className={'cover-btn'} onClick={() => makeCoverHandler(index)}>
									{t('Set cover')}
								</button>
							)}
							<IconButton size={'small'} className={'remove-btn'} onClick={() => removeImageHandler(index)}>
								<CloseRoundedIcon fontSize={'small'} />
							</IconButton>
						</Stack>
					))}
					{form.productImages.length < MAX_IMAGES && (
						<Button component={'label'} className={'image-add'} disabled={uploading}>
							{uploading ? <CircularProgress size={22} color={'inherit'} /> : <AddPhotoAlternateOutlinedIcon />}
							<span>
								{form.productImages.length}/{MAX_IMAGES}
							</span>
							<input hidden multiple type={'file'} accept={'image/png,image/jpeg'} onChange={uploadImagesHandler} />
						</Button>
					)}
				</Stack>
			</Stack>

			<Stack className={'form-grid'}>
				<TextField
					className={'wide'}
					label={t('Title')}
					value={form.productTitle}
					onChange={(e) => changeHandler('productTitle', e.target.value)}
					inputProps={{ maxLength: 100 }}
				/>
				<TextField
					label={t('Brand')}
					value={form.productBrand}
					onChange={(e) => changeHandler('productBrand', e.target.value)}
					inputProps={{ maxLength: 60 }}
				/>
				<TextField
					select
					label={t('Category')}
					value={form.productCategory}
					onChange={(e) => changeHandler('productCategory', e.target.value as ProductCategory)}
				>
					{Object.values(ProductGroup).flatMap((group) => [
						<ListSubheader key={group}>{t(groupLabels[group])}</ListSubheader>,
						...categoriesOf(group).map((category) => (
							<MenuItem key={category} value={category}>
								{t(categoryLabels[category])}
							</MenuItem>
						)),
					])}
				</TextField>
				<TextField
					label={t('Price')}
					type={'number'}
					value={form.productPrice}
					onChange={(e) => changeHandler('productPrice', e.target.value)}
					InputProps={{ startAdornment: <InputAdornment position={'start'}>{CURRENCY}</InputAdornment> }}
					inputProps={{ min: 0 }}
				/>
				<TextField
					label={t('Discount')}
					type={'number'}
					value={form.productDiscount}
					onChange={(e) => changeHandler('productDiscount', e.target.value)}
					InputProps={{ endAdornment: <InputAdornment position={'end'}>%</InputAdornment> }}
					inputProps={{ min: 0, max: 99 }}
				/>
				<TextField
					label={t('Stock')}
					type={'number'}
					value={form.productStock}
					onChange={(e) => changeHandler('productStock', e.target.value)}
					inputProps={{ min: 0, step: 1 }}
				/>
				<TextField
					label={t('Material')}
					value={form.productMaterial}
					onChange={(e) => changeHandler('productMaterial', e.target.value)}
				/>
			</Stack>

			<Stack className={'form-section'}>
				<span className={'field-label'}>{t('Gender')}</span>
				<Stack className={'chip-list'}>
					{Object.values(ProductGender).map((gender) => (
						<button
							key={gender}
							className={`chip ${form.productGender === gender ? 'active' : ''}`}
							onClick={() => changeHandler('productGender', gender)}
						>
							{t(genderLabels[gender])}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'form-section'}>
				<span className={'field-label'}>{t('Size')}</span>
				<Stack className={'size-list'}>
					{productSizes.map((size) => (
						<button
							key={size}
							className={`size ${form.productSizes.includes(size) ? 'active' : ''}`}
							onClick={() => changeHandler('productSizes', toggle(form.productSizes, size))}
						>
							{size}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'form-section'}>
				<span className={'field-label'}>{t('Color')}</span>
				<Stack className={'color-list'}>
					{Object.values(ProductColor).map((color) => (
						<button
							key={color}
							title={t(color)}
							className={`swatch ${form.productColors.includes(color) ? 'active' : ''} ${color.toLowerCase()}`}
							style={{ background: colorHex[color] }}
							onClick={() => changeHandler('productColors', toggle(form.productColors, color))}
						>
							{form.productColors.includes(color) && <CheckRoundedIcon />}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'form-section'}>
				<span className={'field-label'}>{t('Season')}</span>
				<Stack className={'chip-list'}>
					{Object.values(ProductSeason).map((season) => (
						<button
							key={season}
							className={`chip ${form.productSeasons.includes(season) ? 'active' : ''}`}
							onClick={() => changeHandler('productSeasons', toggle(form.productSeasons, season))}
						>
							{t(seasonLabels[season])}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'form-section'}>
				<span className={'field-label'}>{t('Fit')}</span>
				<Stack className={'chip-list'}>
					{Object.values(ProductFit).map((fit) => (
						<button
							key={fit}
							className={`chip ${form.productFit === fit ? 'active' : ''}`}
							onClick={() => changeHandler('productFit', form.productFit === fit ? '' : fit)}
						>
							{t(fitLabels[fit])}
						</button>
					))}
				</Stack>
			</Stack>

			<Stack className={'form-grid'}>
				<TextField
					className={'wide'}
					label={t('Description')}
					value={form.productDesc}
					onChange={(e) => changeHandler('productDesc', e.target.value)}
					multiline
					minRows={4}
					inputProps={{ maxLength: 5000 }}
				/>
				<TextField
					className={'wide'}
					label={t('Tags')}
					placeholder={'linen, summer, basic'}
					value={form.productTags}
					onChange={(e) => changeHandler('productTags', e.target.value)}
				/>
			</Stack>

			<FormControlLabel
				className={'switch-row'}
				control={
					<Switch
						checked={form.productFreeShipping}
						onChange={(e) => changeHandler('productFreeShipping', e.target.checked)}
					/>
				}
				label={t('Free shipping')}
			/>

			<Stack className={'form-actions'}>
				<Button variant={'outlined'} size={'large'} onClick={() => router.back()}>
					{t('Cancel')}
				</Button>
				<Button variant={'contained'} size={'large'} onClick={submitHandler} disabled={saving || uploading}>
					{productId ? t('Save') : t('Publish')}
				</Button>
			</Stack>
		</Stack>
	);
};

export default AddProduct;
