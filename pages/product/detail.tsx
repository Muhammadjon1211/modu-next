import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, CircularProgress, IconButton, Rating, Stack, Tab, Tabs } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ProductGallery from '../../libs/components/product/ProductGallery';
import RelatedProducts from '../../libs/components/product/RelatedProducts';
import CommentList from '../../libs/components/common/CommentList';
import { Product } from '../../libs/types/product/product';
import { GET_PRODUCT } from '../../apollo/user/query';
import { ADD_TO_CART, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { cartCountVar, userVar } from '../../apollo/store';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { ProductStatus } from '../../libs/enums/product.enum';
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
import { formatPrice, getMemberImage, likeTargetProductHandler, salePrice } from '../../libs/utils';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ProductDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [productId, setProductId] = useState<string>('');
	const [product, setProduct] = useState<Product | null>(null);
	const [quantity, setQuantity] = useState<number>(1);
	const [tab, setTab] = useState<string>('details');
	const [adding, setAdding] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [addToCart] = useMutation(ADD_TO_CART);

	const { loading, refetch } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'cache-and-network',
		variables: { input: productId },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProduct) setProduct(data.getProduct);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setProductId(router.query.id as string);
			setQuantity(1);
		}
	}, [router]);

	/** HANDLERS **/
	const likeProductHandler = async () => {
		if (!product) return;
		await likeTargetProductHandler(likeTargetProduct, product._id, user?._id);
		await refetch({ input: productId });
	};

	const addToCartHandler = async (goToCart: boolean) => {
		try {
			if (!product) return;
			if (!user?._id) {
				if (await sweetLoginConfirmAlert(t('Please login first!'))) await router.push('/account/join');
				return;
			}
			if (product.productStock < quantity) throw new Error(Message.NOT_ENOUGH_STOCK);

			setAdding(true);
			const { data } = await addToCart({
				variables: { input: { productId: product._id, itemQuantity: quantity } },
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
			<Link href={{ pathname: '/member', query: { memberId: product.memberId } }} className={'brand'}>
				{product.productBrand}
			</Link>
			<h1 className={'title'}>{product.productTitle}</h1>
			{product.productRatingCount > 0 && (
				<Stack className={'rating'} onClick={() => setTab('reviews')}>
					<Rating value={product.productRating} precision={0.5} readOnly size={'small'} />
					<span>
						{product.productRating.toFixed(1)} ({product.productRatingCount})
					</span>
				</Stack>
			)}
			<Stack className={'price'}>
				{product.productDiscount > 0 && <span className={'discount'}>{product.productDiscount}%</span>}
				<strong>{formatPrice(salePrice(product.productPrice, product.productDiscount))}</strong>
				{product.productDiscount > 0 && <s>{formatPrice(product.productPrice)}</s>}
			</Stack>

			<Stack className={'option-row'}>
				<span className={'option-label'}>{t('Size')}</span>
				<Stack className={'size-list'}>
					{product.productSizes.map((size) => (
						<span key={size} className={'size'}>
							{size}
						</span>
					))}
				</Stack>
			</Stack>
			<Stack className={'option-row'}>
				<span className={'option-label'}>{t('Color')}</span>
				<Stack className={'color-list'}>
					{product.productColors.map((color) => (
						<span
							key={color}
							className={`swatch ${color.toLowerCase()}`}
							style={{ background: colorHex[color] }}
							title={t(color)}
						/>
					))}
				</Stack>
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
				<IconButton className={`like-btn ${liked ? 'liked' : ''}`} onClick={likeProductHandler}>
					{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
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

	const infoTabs = (
		<Stack className={'info-tabs'}>
			<Tabs value={tab} onChange={(e, value) => setTab(value)}>
				<Tab value={'details'} label={t('Details')} />
				<Tab value={'reviews'} label={`${t('Reviews')} (${product.productComments})`} />
			</Tabs>
			{tab === 'details' ? (
				<Stack className={'details-pane'}>
					{product.productDesc && <p className={'desc'}>{product.productDesc}</p>}
					<Stack className={'spec-list'}>
						{specs.map((spec) => (
							<Stack key={spec.label} className={'spec'}>
								<span>{t(spec.label)}</span>
								<strong>{spec.value}</strong>
							</Stack>
						))}
					</Stack>
					{!!product.productTags?.length && (
						<Stack className={'tag-list'}>
							{product.productTags.map((tag) => (
								<span key={tag}>#{tag}</span>
							))}
						</Stack>
					)}
				</Stack>
			) : (
				<CommentList
					refId={product._id}
					group={CommentGroup.PRODUCT}
					withRating
					onChanged={() => refetch({ input: productId })}
				/>
			)}
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<div id="product-detail-page">
				<ProductGallery images={product.productImages} title={product.productTitle} />
				{buyBox}
				{infoTabs}
				<RelatedProducts productId={product._id} />
			</div>
		);
	} else {
		return (
			<div id="product-detail-page">
				<Stack className={'container'}>
					<Stack className={'detail-top'}>
						<ProductGallery
							images={product.productImages}
							title={product.productTitle}
							discount={product.productDiscount}
						/>
						{buyBox}
					</Stack>
					{infoTabs}
					<RelatedProducts productId={product._id} />
				</Stack>
			</div>
		);
	}
};

export default withLayoutFull(ProductDetail);
