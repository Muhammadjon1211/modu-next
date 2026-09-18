import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, CircularProgress, IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import CommentList from '../../libs/components/common/CommentList';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { GET_BOARD_ARTICLE } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { articleCategoryLabels } from '../../libs/config';
import {
	formatDate,
	getImageUrl,
	getMemberImage,
	imageFallbackHandler,
	likeTargetBoardArticleHandler,
} from '../../libs/utils';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

const TuiViewer = dynamic(() => import('../../libs/components/community/TuiViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [articleId, setArticleId] = useState<string>('');
	const [article, setArticle] = useState<BoardArticle | null>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const { loading, refetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'cache-and-network',
		variables: { input: articleId },
		skip: !articleId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getBoardArticle) setArticle(data.getBoardArticle);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) setArticleId(router.query.id as string);
	}, [router]);

	/** HANDLERS **/
	const likeArticleHandler = async () => {
		if (!article) return;
		await likeTargetBoardArticleHandler(likeTargetBoardArticle, article._id, user?._id);
		await refetch({ input: articleId });
	};

	const deleteArticleHandler = async () => {
		try {
			if (!article) return;
			if (!(await sweetConfirmAlert(t('Delete this post?')))) return;
			await updateBoardArticle({
				variables: { input: { _id: article._id, articleStatus: BoardArticleStatus.DELETE } },
			});
			await router.push(`/community?articleCategory=${article.articleCategory}`);
		} catch (err: any) {
			console.log('ERROR, deleteArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!article) {
		return (
			<div id="community-detail-page">
				<Stack className={'loading-box'}>
					{loading || !articleId ? (
						<CircularProgress color={'inherit'} />
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No data found!')}</p>
						</div>
					)}
				</Stack>
			</div>
		);
	}

	const liked = !!article.meLiked?.[0]?.myFavorite;
	const isMine = article.memberId === user?._id;

	const content = (
		<Stack className={'article-wrap'}>
			<Link href={`/community?articleCategory=${article.articleCategory}`} className={'back-link'}>
				<ArrowBackRoundedIcon fontSize={'small'} /> {t(articleCategoryLabels[article.articleCategory])}
			</Link>
			<h1 className={'article-title'}>{article.articleTitle}</h1>
			<Stack className={'article-meta'}>
				<Link href={{ pathname: '/member', query: { memberId: article.memberId } }} className={'author'}>
					<Avatar src={getMemberImage(article.memberData?.memberImage)} />
					<Stack>
						<strong>{article.memberData?.memberShopName || article.memberData?.memberNick}</strong>
						<span>{formatDate(article.createdAt, 'YYYY.MM.DD HH:mm')}</span>
					</Stack>
				</Link>
				<Stack className={'meta-right'}>
					<span>
						<VisibilityOutlinedIcon fontSize={'small'} /> {article.articleViews}
					</span>
					<IconButton className={`like-btn ${liked ? 'liked' : ''}`} onClick={likeArticleHandler}>
						{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</IconButton>
					<span>{article.articleLikes}</span>
					{isMine && (
						<Button size={'small'} color={'secondary'} onClick={deleteArticleHandler}>
							{t('Delete')}
						</Button>
					)}
				</Stack>
			</Stack>
			{article.articleImage && (
				<img
					className={'article-cover'}
					src={getImageUrl(article.articleImage, '/img/placeholder/article.svg')}
					alt={''}
					onError={imageFallbackHandler('/img/placeholder/article.svg')}
				/>
			)}
			<Stack className={'article-content'}>
				<TuiViewer key={article._id} content={article.articleContent} />
			</Stack>
			<Stack className={'article-comments'}>
				<h3>
					{t('Comments')} <span>{article.articleComments}</span>
				</h3>
				<CommentList refId={article._id} group={CommentGroup.ARTICLE} onChanged={() => refetch({ input: articleId })} />
			</Stack>
		</Stack>
	);

	if (device === 'mobile') {
		return <div id="community-detail-page">{content}</div>;
	} else {
		return (
			<div id="community-detail-page">
				<Stack className={'container'}>{content}</Stack>
			</div>
		);
	}
};

export default withLayoutFull(CommunityDetail);
