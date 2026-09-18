import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Avatar, IconButton, Stack } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { BoardArticle } from '../../types/board-article/board-article';
import { articleCategoryLabels } from '../../config';
import { formatDate, getImageUrl, getMemberImage, imageFallbackHandler } from '../../utils';

interface ArticleCardType {
	article: BoardArticle;
	likeArticleHandler?: any;
}

const ArticleCard = (props: ArticleCardType) => {
	const { article, likeArticleHandler } = props;
	const { t } = useTranslation('common');
	const liked: boolean = !!article?.meLiked?.[0]?.myFavorite;
	const href = { pathname: '/community/detail', query: { id: article?._id } };

	return (
		<Stack className={'article-card'}>
			<Link href={href} className={'article-img'}>
				<img
					src={getImageUrl(article?.articleImage, '/img/placeholder/article.svg')}
					alt={article?.articleTitle}
					onError={imageFallbackHandler('/img/placeholder/article.svg')}
					loading={'lazy'}
				/>
				<span className={'category'}>{t(articleCategoryLabels[article?.articleCategory])}</span>
			</Link>
			<Stack className={'article-info'}>
				<Link href={href} className={'title'}>
					{article?.articleTitle}
				</Link>
				<Stack className={'meta'}>
					<Link href={{ pathname: '/member', query: { memberId: article?.memberId } }} className={'author'}>
						<Avatar src={getMemberImage(article?.memberData?.memberImage)} />
						<span>{article?.memberData?.memberNick}</span>
					</Link>
					<span className={'date'}>{formatDate(article?.createdAt)}</span>
				</Stack>
				<Stack className={'counts'}>
					<span>
						<VisibilityOutlinedIcon /> {article?.articleViews}
					</span>
					<span>
						<ChatBubbleOutlineRoundedIcon /> {article?.articleComments}
					</span>
					{likeArticleHandler ? (
						<IconButton
							size={'small'}
							className={`like-btn ${liked ? 'liked' : ''}`}
							onClick={() => likeArticleHandler(article?._id)}
						>
							{liked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							<em>{article?.articleLikes}</em>
						</IconButton>
					) : (
						<span>
							<FavoriteBorderRoundedIcon /> {article?.articleLikes}
						</span>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default ArticleCard;
