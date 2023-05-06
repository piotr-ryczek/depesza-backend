import { LeanDocument } from 'mongoose';
import { PublisherDocument } from 'src/schemas/publisher.schema';

export type CleanedPublisher = Omit<
  LeanDocument<PublisherDocument>,
  | 'initialCode'
  | 'password'
  | 'secondFactorSecret'
  | 'apiKey'
  | 'apiPassword'
  | 'articlesReported'
  | 'createdAt'
>;
