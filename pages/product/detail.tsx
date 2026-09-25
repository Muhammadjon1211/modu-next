import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, CircularProgress, IconButton, Rating, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ProductGallery from '../../libs/components/product/ProductGallery';
import RelatedProducts from '../../libs/components/product/RelatedProducts';
import CommentList from '../../libs/components/common/CommentList';
import Seo, { SeoProps } from '../../libs/components/common/Seo';
import { Product } from '../../libs/types/product/product';
import { GET_PRODUCT } from '../../apollo/user/query';
import { ADD_TO_CART, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { cartCountVar, navDepthVar, userVar } from '../../apollo/store';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { ProductColor, ProductSize, ProductStatus } from '../../libs/enums/product.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import {
	categoryLabels,
	colorHex,
	DELIVERY_FEE,
	fitLabels,
	genderLabels,
	RETURN_WINDOW_DAYS,
	seasonLabels,
} from '../../libs/config';
import {
	formatPrice,
	formatterStr,
	getMemberImage,
	likeTargetProductHandler,
	salePrice,
	shareLink,
	toggleProductLike,
} from '../../libs/utils';
import { fetchProductSeo } from '../../libs/seo';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

/**
 * Rendered on the server so a shared link carries this product's title, price and photo —
 * messengers read the preview tags from the first HTML and never run the page's JavaScript.
 */
export const getServerSideProps = async ({ locale, query }: any) => {
	const [translations, seo] = await Promise.all([
		serverSideTranslations(locale, ['common']),
		fetchProductSeo(query?.id),
	]);
	return { props: { ...translations, seo } };
};

interface ProductDetailProps {
	seo: SeoProps | null;
}

const ProductDetail: NextPage<ProductDetailProps> = ({ seo }) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [productId, setProductId] = useState<string>('');
	const [product, setProduct] = useState<Product | null>(null);
	const [quantity, setQuantity] = useState<number>(1);
	const [size, setSize] = useState<ProductSize | ''>('');
	const [color, setColor] = useState<ProductColor | ''>('');
	const [adding, setAdding] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	// no-cache: the answer must not overwrite the optimistic heart through the cached product
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT, { fetchPolicy: 'no-cache' });
	const [addToCart] = useMutation(ADD_TO_CART);

	const { loading, refetch } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'cache-and-network',
		variables: { input: productId },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const found: Product | undefined = data?.getProduct;
			if (!found) return;
			setProduct(found);
			// a single option is picked for the buyer; several make them choose
			if (found.productSizes?.length === 1) setSize(found.productSizes[0]);
			if (found.productColors?.length === 1) setColor(found.productColors[0]);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setProductId(router.query.id as string);
			setQuantity(1);
			setSize('');
			setColor('');
		}
	}, [router]);

	/** HANDLERS **/
	// straight back where the shopper came from, or to the shop when the page was opened directly
	const backHandler = () => {
		if (navDepthVar() > 0) router.back();
		else router.push('/product').then();
	};

	const scrollToReviewsHandler = () => {
		document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	// the heart flips at once; the server call follows, and a failure flips it back
	const likeProductHandler = async () => {
		if (!product) return;
		if (!user?._id) {
			await likeTargetProductHandler(likeTargetProduct, product._id, user?._id);
			return;
		}
		setProduct((current) => (current ? toggleProductLike(current) : current));
		const saved = await likeTargetProductHandler(likeTargetProduct, product._id, user._id);
		if (!saved) setProduct((current) => (current ? toggleProductLike(current) : current));
	};

	const shareHandler = async () => {
		if (!product) return;
		// the page's own address, so the link opens in the viewer's language too
		const result = await shareLink(window.location.href, product.productTitle);
		if (result === 'copied') await sweetTopSmallSuccessAlert(t('Link copied'), 1500);
	};

	const addToCartHandler = async (goToCart: boolean) => {
		try {
			if (!product) return;
			if (!user?._id) {
				if (await sweetLoginConfirmAlert(t('Please login first!'))) await router.push('/account/join');
				return;
			}
			if (product.productSizes?.length && !size) throw new Error(t('Please choose a size!'));
			if (product.productColors?.length && !color) throw new Error(t('Please choose a color!'));
			if (product.productStock < quantity) throw new Error(Message.NOT_ENOUGH_STOCK);

			setAdding(true);
			const { data } = await addToCart({
				variables: {
					input: {
						productId: product._id,
						itemQuantity: quantity,
						...(size ? { itemSize: size } : {}),
						...(color ? { itemColor: color } : {}),
					},
				},
			});
			cartCountVar(data?.addToCart?.orderItems?.length ?? 0);

			if (goToCart) await router.push('/cart');
			else await sweetTopSmallSuccessAlert(t('Added to cart'), 1000);
		} catch (err: any) {
			console.log('ERROR, addToCartHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setAdding(false);
		}
	};

	if (!product) {
		return (
			<div id="product-detail-page">
				<Seo {...(seo ?? { path: `/product/detail?id=${productId}` })} />
				<Stack className={'loading-box'}>
					{loading || !productId ? (
						<CircularProgress color={'inherit'} />
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No products found!')}</p>
						</div>
					)}
				</Stack>
			</div>
		);
	}

	const liked = !!product?.meLiked?.[0]?.myFavorite;
	const soldOut = product.productStatus === ProductStatus.SOLD_OUT || product.productStock <= 0;
	const isOwner = product.memberId === user?._id;
	const seller = product.memberData;
	const specs = [
		{ label: 'Category', value: t(categoryLabels[product.productCategory]) },
		{ label: 'Gender', value: t(genderLabels[product.productGender]) },
		{ label: 'Fit', value: product.productFit ? t(fitLabels[product.productFit]) : '' },
		{ label: 'Material', value: product.productMaterial ?? '' },
		{ label: 'Season', value: product.productSeasons?.map((ele) => t(seasonLabels[ele])).join(', ') ?? '' },
	].filter((ele) => ele.value);

	const buyBox = (
		<Stack className={'buy-box'}>
			<Stack className={'brand-row'}>
				<Link href={{ pathname: '/member', query: { memberId: product.memberId } }} className={'brand'}>
					{product.productBrand}
				</Link>
				{product.productRatingCount > 0 && (
					<button type={'button'} className={'rating'} onClick={scrollToReviewsHandler}>
						<StarRoundedIcon />
						{product.productRating.toFixed(1)}
						<em>({product.productRatingCount})</em>
					</button>
				)}
			</Stack>
			<h1 className={'title'}>{product.productTitle}</h1>
			<Stack className={'price'}>
				{product.productDiscount > 0 && <span className={'discount'}>{product.productDiscount}%</span>}
				<strong>{formatPrice(salePrice(product.productPrice, product.productDiscount))}</strong>
				{product.productDiscount > 0 && <s>{formatPrice(product.productPrice)}</s>}
			</Stack>

			<Stack className={'option-row'}>
				<span className={'option-label'}>{t('Size')}</span>
				<Stack className={'size-list'}>
					{product.productSizes.map((ele) => (
						<button
							key={ele}
							type={'button'}
							className={`size ${size === ele ? 'active' : ''}`}
							disabled={soldOut}
							onClick={() => setSize(ele)}
						>
							{ele}
						</button>
					))}
				</Stack>
			</Stack>
			<Stack className={'option-row'}>
				<span className={'option-label'}>{t('Color')}</span>
				<Stack className={'color-list'}>
					{product.productColors.map((ele) => (
						<button
							key={ele}
							type={'button'}
							className={`swatch ${ele.toLowerCase()} ${color === ele ? 'active' : ''}`}
							style={{ background: colorHex[ele] }}
							title={t(ele)}
							aria-label={ele}
							disabled={soldOut}
							onClick={() => setColor(ele)}
						>
							{color === ele && <CheckRoundedIcon />}
						</button>
					))}
				</Stack>
				{color && <span className={'option-value'}>{t(color)}</span>}
			</Stack>

			{!soldOut && !isOwner && (
				<Stack className={'option-row'}>
					<span className={'option-label'}>{t('Quantity')}</span>
					<Stack className={'qty-stepper'}>
						<IconButton size={'small'} disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}>
							<RemoveRoundedIcon fontSize={'small'} />
						</IconButton>
						<span>{quantity}</span>
						<IconButton
							size={'small'}
							disabled={quantity >= product.productStock}
							onClick={() => setQuantity(quantity + 1)}
						>
							<AddRoundedIcon fontSize={'small'} />
						</IconButton>
					</Stack>
					{product.productStock <= 5 && (
						<span className={'stock-left'}>
							{product.productStock} {t('left')}
						</span>
					)}
				</Stack>
			)}

			<Stack className={'buy-actions'}>
				{isOwner ? (
					<Link href={{ pathname: '/mypage', query: { category: 'addProduct', productId: product._id } }}>
						<Button variant={'contained'} size={'large'} fullWidth>
							{t('Edit')}
						</Button>
					</Link>
				) : soldOut ? (
					<Button variant={'contained'} size={'large'} disabled fullWidth>
						{t('Sold out')}
					</Button>
				) : (
					<>
						<Button
							variant={'outlined'}
							size={'large'}
							disabled={adding || user?.memberType === MemberType.ADMIN}
							onClick={() => addToCartHandler(false)}
						>
							{t('Add to cart')}
						</Button>
						<Button
							variant={'contained'}
							size={'large'}
							disabled={adding || user?.memberType === MemberType.ADMIN}
							onClick={() => addToCartHandler(true)}
						>
							{t('Buy now')}
						</Button>
					</>
				)}
				<IconButton className={`like-btn ${liked ? 'liked' : ''}`} aria-label={t('Like')} onClick={likeProductHandler}>
					{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</IconButton>
				<IconButton className={'share-btn'} aria-label={t('Share')} onClick={shareHandler}>
					<IosShareRoundedIcon />
				</IconButton>
			</Stack>

			<Stack className={'perks'}>
				<span>
					<LocalShippingOutlinedIcon />
					{product.productFreeShipping ? t('Free shipping') : formatPrice(DELIVERY_FEE)}
				</span>
				<span>
					<AssignmentReturnOutlinedIcon />
					{t('{{days}}-day returns', { days: RETURN_WINDOW_DAYS })}
				</span>
				{product.productSales > 0 && (
					<span className={'sold-count'}>
						{t('Sold')} {formatterStr(product.productSales)}
					</span>
				)}
			</Stack>

			{seller && (
				<Link href={{ pathname: '/member', query: { memberId: seller._id } }} className={'seller-mini'}>
					<Avatar src={getMemberImage(seller.memberImage)} />
					<Stack>
						<strong>{seller.memberShopName || seller.memberNick}</strong>
						<span>
							{seller.memberProducts} {t('Products')} · {seller.memberFollowers} {t('Followers')}
						</span>
					</Stack>
				</Link>
			)}
		</Stack>
	);

	const backBar = (
		<button type={'button'} className={'back-link'} onClick={backHandler}>
			<ArrowBackRoundedIcon fontSize={'small'} /> {t('Back')}
		</button>
	);

	const details = (
		<Stack className={'details-pane'}>
			{product.productDesc && <p className={'desc'}>{product.productDesc}</p>}
			{specs.length > 0 && (
				<Stack className={'spec-list'}>
					{specs.map((spec) => (
						<Stack key={spec.label} className={'spec'}>
							<span>{t(spec.label)}</span>
							<strong>{spec.value}</strong>
						</Stack>
					))}
				</Stack>
			)}
			{!!product.productTags?.length && (
				<Stack className={'tag-list'}>
					{product.productTags.map((tag) => (
						<span key={tag}>#{tag}</span>
					))}
				</Stack>
			)}
		</Stack>
	);

	const reviews = (
		<Stack className={'reviews-section'} id={'reviews'}>
			<Stack className={'reviews-head'}>
				<h2>
					{t('Reviews')} <span>{product.productComments}</span>
				</h2>
				{product.productRatingCount > 0 && (
					<Stack className={'rating'}>
						<Rating value={product.productRating} precision={0.5} readOnly size={'small'} />
						<strong>{product.productRating.toFixed(1)}</strong>
					</Stack>
				)}
			</Stack>
			<CommentList
				refId={product._id}
				group={CommentGroup.PRODUCT}
				withRating
				onChanged={() => refetch({ input: productId })}
			/>
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<div id="product-detail-page">
				<Seo {...(seo ?? { path: `/product/detail?id=${productId}` })} />
				<Stack className={'back-row'}>{backBar}</Stack>
				<ProductGallery images={product.productImages} title={product.productTitle} />
				{buyBox}
				{details}
				{reviews}
				<RelatedProducts productId={product._id} />
			</div>
		);
	} else {
		return (
			<div id="product-detail-page">
				<Seo {...(seo ?? { path: `/product/detail?id=${productId}` })} />
				<Stack className={'container'}>
					{backBar}
					<Stack className={'detail-top'}>
						<Stack className={'detail-left'}>
							<ProductGallery
								images={product.productImages}
								title={product.productTitle}
								discount={product.productDiscount}
							/>
							{reviews}
						</Stack>
						<Stack className={'detail-right'}>
							{buyBox}
							{details}
						</Stack>
					</Stack>
					<RelatedProducts productId={product._id} />
				</Stack>
			</div>
		);
	}
};

export default withLayoutFull(ProductDetail);
