import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArticleCard from '../common/ArticleCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { T } from '../../types/common';

interface CommunityPreviewType {
	initialInput?: BoardArticlesInquiry;
}

const CommunityPreview = (props: CommunityPreviewType) => {
	const {
		initialInput = {
			page: 1,
			limit: 4,
			sort: 'createdAt',
			direction: Direction.DESC,
			articleCategory: BoardArticleCategory.LOOKBOOK,
			search: {},
		},
	} = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [articles, setArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		onCompleted: (data: T) => {
			setArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	if (!articles.length) return null;

	return (
		<Stack className={'community-preview'}>
			<Stack className={'container'}>
				<Stack className={'section-head'}>
					<h2>{t('Lookbook')}</h2>
					<Link href={'/community?articleCategory=LOOKBOOK'} className={'see-all'}>
						{t('See all')} <ArrowForwardRoundedIcon />
					</Link>
				</Stack>
				<Stack className={device === 'mobile' ? 'article-scroll' : 'article-grid'}>
					{articles.map((article) => (
						<ArticleCard key={article._id} article={article} />
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityPreview;
