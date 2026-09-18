import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';

export interface BoardArticleUpdate {
	_id: string;
	articleCategory?: BoardArticleCategory;
	articleStatus?: BoardArticleStatus;
	articleTitle?: string;
	articleContent?: string;
	articleImage?: string;
}
