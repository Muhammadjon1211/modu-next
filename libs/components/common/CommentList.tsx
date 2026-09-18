import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, IconButton, Pagination, Rating, Stack, TextField } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Comment } from '../../types/comment/comment';
import { CommentsInquiry } from '../../types/comment/comment.input';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { Direction, Message } from '../../enums/common.enum';
import { formatDate, getMemberImage } from '../../utils';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Messages } from '../../config';
import { T } from '../../types/common';

interface CommentListType {
	refId: string;
	group: CommentGroup;
	withRating?: boolean;
	onChanged?: () => void;
}

const CommentList = (props: CommentListType) => {
	const { refId, group, withRating = false, onChanged } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [content, setContent] = useState<string>('');
	const [rating, setRating] = useState<number | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: refId },
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const { refetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { ...searchFilter, search: { commentRefId: refId } } },
		skip: !refId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const createCommentHandler = async () => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!content.trim()) throw new Error(Messages.error4);

			const input: T = { commentGroup: group, commentContent: content.trim(), commentRefId: refId };
			if (withRating && rating) input.commentRating = rating;

			setSaving(true);
			await createComment({ variables: { input } });
			setContent('');
			setRating(null);
			await refetch({ input: { ...searchFilter, page: 1, search: { commentRefId: refId } } });
			setSearchFilter({ ...searchFilter, page: 1 });
			onChanged?.();
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, createCommentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSaving(false);
		}
	};

	const deleteCommentHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Delete this comment?')))) return;
			await updateComment({ variables: { input: { _id: id, commentStatus: CommentStatus.DELETE } } });
			await refetch({ input: { ...searchFilter, search: { commentRefId: refId } } });
			onChanged?.();
		} catch (err: any) {
			console.log('ERROR, deleteCommentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'comment-list'}>
			{user?._id ? (
				<Stack className={'comment-form'}>
					{withRating && <Rating value={rating} onChange={(e, value) => setRating(value)} size={'large'} />}
					<TextField
						multiline
						minRows={3}
						fullWidth
						placeholder={withRating ? t('Share your thoughts') : t('Write a comment')}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						inputProps={{ maxLength: 3000 }}
					/>
					<Button
						variant={'contained'}
						onClick={createCommentHandler}
						disabled={saving || !content.trim()}
						className={'submit-btn'}
					>
						{t('Post')}
					</Button>
				</Stack>
			) : (
				<Stack className={'comment-login'}>
					<Link href={'/account/join'}>
						<Button variant={'outlined'}>{t('Login to comment')}</Button>
					</Link>
				</Stack>
			)}

			{comments.length ? (
				comments.map((comment) => (
					<Stack key={comment._id} className={'comment-item'}>
						<Avatar src={getMemberImage(comment?.memberData?.memberImage)} />
						<Stack className={'comment-body'}>
							<Stack className={'comment-head'}>
								<Link href={{ pathname: '/member', query: { memberId: comment.memberId } }}>
									{comment?.memberData?.memberNick}
								</Link>
								{comment.isSellerReply && <span className={'seller-tag'}>{t('Shop owner')}</span>}
								{comment.commentRating ? <Rating value={comment.commentRating} readOnly size={'small'} /> : null}
								<span className={'date'}>{formatDate(comment.createdAt)}</span>
								{comment.memberId === user?._id && (
									<IconButton size={'small'} className={'delete-btn'} onClick={() => deleteCommentHandler(comment._id)}>
										<DeleteOutlineRoundedIcon fontSize={'small'} />
									</IconButton>
								)}
							</Stack>
							<p>{comment.commentContent}</p>
						</Stack>
					</Stack>
				))
			) : (
				<div className={'no-data small'}>
					<p>{t('No comments yet')}</p>
				</div>
			)}

			{total > searchFilter.limit && (
				<Stack className={'pagination-config'}>
					<Pagination
						page={searchFilter.page}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={handlePaginationChange}
						shape={'circular'}
						size={'small'}
					/>
				</Stack>
			)}
		</Stack>
	);
};

export default CommentList;
