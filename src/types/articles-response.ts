import { ArticleDocument } from 'src/schemas/article.schema';

export type ArticlesResponse = {
  articles: ArticleDocument[];
  countAll: number;
};
