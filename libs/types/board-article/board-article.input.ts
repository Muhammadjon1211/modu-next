import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';

export interface BoardArticleInput {
	articleCategory: BoardArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImage?: string;
}

interface BASearch {
	memberId?: string;
	text?: string;
}

export interface BoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	articleCategory: BoardArticleCategory;
	search: BASearch;
}

interface ALBASearch {
	articleStatus?: BoardArticleStatus;
	articleCategory?: BoardArticleCategory;
}

export interface AllBoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALBASearch;
}
