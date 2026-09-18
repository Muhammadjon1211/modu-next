import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Button, Stack } from '@mui/material';
import { Order, OrderItem } from '../../types/order/order';
import { Product } from '../../types/product/product';
import { OrderStatus } from '../../enums/order.enum';
import { formatDate, formatPrice, getImageUrl, imageFallbackHandler, salePrice } from '../../utils';

export const orderStatusLabels: Record<OrderStatus, string> = {
	[OrderStatus.PAUSE]: 'In cart',
	[OrderStatus.PROCESS]: 'Processing',
	[OrderStatus.FINISH]: 'Completed',
	[OrderStatus.CANCEL]: 'Cancelled',
};

interface OrderCardType {
	order: Order;
	sellerId?: string;
	cancelOrderHandler?: (order: Order) => void;
	finishOrderHandler?: (order: Order) => void;
	returnItemHandler?: (item: OrderItem, product?: Product) => void;
}

const OrderCard = (props: OrderCardType) => {
	const { order, sellerId, cancelOrderHandler, finishOrderHandler, returnItemHandler } = props;
	const { t } = useTranslation('common');
	const productOf = (id: string) => order.productData?.find((ele) => ele._id === id);
	const lines = (order.orderItems ?? []).filter((ele) => !sellerId || ele.sellerId === sellerId);
	const returnable = [OrderStatus.PROCESS, OrderStatus.FINISH].includes(order.orderStatus);
	const sellerTotal = lines.reduce(
		(sum, ele) => sum + salePrice(ele.itemPrice, ele.itemDiscount) * ele.itemQuantity,
		0,
	);

	return (
		<Stack className={'order-card'}>
			<Stack className={'order-head'}>
				<Stack>
					<strong>{formatDate(order.purchasedAt ?? order.createdAt, 'YYYY.MM.DD HH:mm')}</strong>
					<span>#{order._id.slice(-8).toUpperCase()}</span>
				</Stack>
				<span className={`status ${order.orderStatus.toLowerCase()}`}>{t(orderStatusLabels[order.orderStatus])}</span>
			</Stack>
			<Stack className={'order-lines'}>
				{lines.map((item) => {
					const product = productOf(item.productId);
					const href = { pathname: '/product/detail', query: { id: item.productId } };
					return (
						<Stack key={item._id} className={'order-line'}>
							<Link href={href} className={'line-img'}>
								<img src={getImageUrl(product?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
							</Link>
							<Stack className={'line-info'}>
								<span className={'brand'}>{product?.productBrand}</span>
								<Link href={href} className={'title'}>
									{product?.productTitle ?? t('Removed product')}
								</Link>
								<span className={'qty'}>
									{formatPrice(salePrice(item.itemPrice, item.itemDiscount))} × {item.itemQuantity}
								</span>
							</Stack>
							{returnItemHandler && returnable && (
								<Stack className={'line-actions'}>
									<Button size={'small'} variant={'outlined'} onClick={() => returnItemHandler(item, product)}>
										{t('Return')}
									</Button>
									<Link href={href}>
										<Button size={'small'}>{t('Review')}</Button>
									</Link>
								</Stack>
							)}
						</Stack>
					);
				})}
			</Stack>
			<Stack className={'order-foot'}>
				<Stack className={'order-total'}>
					<span>{t('Total')}</span>
					<strong>{formatPrice(sellerId ? sellerTotal : order.orderTotal)}</strong>
				</Stack>
				{order.orderStatus === OrderStatus.PROCESS && (cancelOrderHandler || finishOrderHandler) && (
					<Stack className={'order-actions'}>
						{cancelOrderHandler && (
							<Button size={'small'} color={'secondary'} onClick={() => cancelOrderHandler(order)}>
								{t('Cancel order')}
							</Button>
						)}
						{finishOrderHandler && (
							<Button size={'small'} variant={'contained'} onClick={() => finishOrderHandler(order)}>
								{t('Confirm receipt')}
							</Button>
						)}
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default OrderCard;
