import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Pagination, Stack } from '@mui/material';
import ArticleCard from '../common/ArticleCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { articleCategoryLabels } from '../../config';
import { likeTargetBoardArticleHandler } from '../../utils';
import { T } from '../../types/common';

interface MemberArticlesType {
	memberId: string;
}

const MemberArticles = (props: MemberArticlesType) => {
	const { memberId } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>({
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		articleCategory: BoardArticleCategory.LOOKBOOK,
		search: { memberId },
	});

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { ...searchFilter, search: { memberId } } },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getBoardArticles?.list ?? []);
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const categoryHandler = (articleCategory: BoardArticleCategory) => {
		setSearchFilter({ ...searchFilter, page: 1, articleCategory });
	};

	const likeArticleHandler = async (id: string) => {
		await likeTargetBoardArticleHandler(likeTargetBoardArticle, id, user?._id);
		await refetch({ input: { ...searchFilter, search: { memberId } } });
	};

	const handlePaginationChange = (event: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className={'member-articles'}>
			<Stack className={'chip-list'}>
				{Object.values(BoardArticleCategory).map((category) => (
					<button
						key={category}
						className={`chip ${searchFilter.articleCategory === category ? 'active' : ''}`}
						onClick={() => categoryHandler(category)}
					>
						{t(articleCategoryLabels[category])}
					</button>
				))}
			</Stack>
			<Stack className={'article-grid'}>
				{articles.length ? (
					articles.map((article) => (
						<ArticleCard key={article._id} article={article} likeArticleHandler={likeArticleHandler} />
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No posts yet')}</p>
					</div>
				)}
			</Stack>
			{total > searchFilter.limit && (
				<Stack className={'pagination-config'}>
					<Pagination
						page={searchFilter.page}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={handlePaginationChange}
						shape={'circular'}
					/>
				</Stack>
			)}
		</Stack>
	);
};

export default MemberArticles;
