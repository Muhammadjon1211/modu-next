import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Avatar, Button, Stack } from '@mui/material';
import { Return } from '../../types/return/return';
import { ReturnStatus } from '../../enums/return.enum';
import { returnReasonLabels } from '../../config';
import { formatDate, formatPrice, getImageUrl, getMemberImage, imageFallbackHandler } from '../../utils';

export const returnStatusLabels: Record<ReturnStatus, string> = {
	[ReturnStatus.REQUEST]: 'Requested',
	[ReturnStatus.APPROVE]: 'Approved',
	[ReturnStatus.REJECT]: 'Rejected',
	[ReturnStatus.COMPLETE]: 'Refunded',
	[ReturnStatus.CANCEL]: 'Cancelled',
};

interface ReturnCardType {
	item: Return;
	showBuyer?: boolean;
	cancelReturnHandler?: (item: Return) => void;
	updateReturnHandler?: (item: Return, status: ReturnStatus) => void;
}

const ReturnCard = (props: ReturnCardType) => {
	const { item, showBuyer, cancelReturnHandler, updateReturnHandler } = props;
	const { t } = useTranslation('common');
	const product = item.productData;
	const href = { pathname: '/product/detail', query: { id: item.productId } };

	return (
		<Stack className={'return-card'}>
			<Link href={href} className={'line-img'}>
				<img src={getImageUrl(product?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
			</Link>
			<Stack className={'return-info'}>
				<Stack className={'return-top'}>
					<Link href={href} className={'title'}>
						{product?.productTitle}
					</Link>
					<span className={`status ${item.returnStatus.toLowerCase()}`}>
						{t(returnStatusLabels[item.returnStatus])}
					</span>
				</Stack>
				<Stack className={'return-meta'}>
					<span>{t(returnReasonLabels[item.returnReason])}</span>
					<span>× {item.returnQuantity}</span>
					<strong>{formatPrice(item.returnAmount)}</strong>
					<span className={'date'}>{formatDate(item.createdAt)}</span>
				</Stack>
				{item.returnDesc && <p className={'return-desc'}>{item.returnDesc}</p>}
				{showBuyer && item.memberData && (
					<Link href={{ pathname: '/member', query: { memberId: item.memberId } }} className={'buyer'}>
						<Avatar src={getMemberImage(item.memberData.memberImage)} />
						<span>{item.memberData.memberNick}</span>
					</Link>
				)}
			</Stack>
			<Stack className={'return-actions'}>
				{cancelReturnHandler && item.returnStatus === ReturnStatus.REQUEST && (
					<Button size={'small'} color={'secondary'} onClick={() => cancelReturnHandler(item)}>
						{t('Cancel')}
					</Button>
				)}
				{updateReturnHandler && item.returnStatus === ReturnStatus.REQUEST && (
					<>
						<Button
							size={'small'}
							variant={'contained'}
							onClick={() => updateReturnHandler(item, ReturnStatus.APPROVE)}
						>
							{t('Approve')}
						</Button>
						<Button size={'small'} color={'secondary'} onClick={() => updateReturnHandler(item, ReturnStatus.REJECT)}>
							{t('Reject')}
						</Button>
					</>
				)}
				{updateReturnHandler && item.returnStatus === ReturnStatus.APPROVE && (
					<>
						<Button
							size={'small'}
							variant={'contained'}
							onClick={() => updateReturnHandler(item, ReturnStatus.COMPLETE)}
						>
							{t('Refund')}
						</Button>
						<Button size={'small'} color={'secondary'} onClick={() => updateReturnHandler(item, ReturnStatus.REJECT)}>
							{t('Reject')}
						</Button>
					</>
				)}
			</Stack>
		</Stack>
	);
};

export default ReturnCard;
