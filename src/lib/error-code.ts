enum ErrorCode {
  INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
  INCORRECT_EMAIL = 'INCORRECT_EMAIL',
  READER_WITH_EMAIL_ALREADY_EXISTS = 'READER_WITH_EMAIL_ALREADY_EXISTS',
  READER_DOES_NOT_EXIST = 'READER_DOES_NOT_EXIST',
  EMAIL_VERIFICATION_FAILED = 'EMAIL_VERIFICATION_FAILED',
  READER_ALREADY_HAS_ACCESS = 'READER_ALREADY_HAS_ACCESS',
  ARTICLE_HAS_BEEN_ALREADY_ADDED_TO_READ = 'ARTICLE_HAS_BEEN_ALREADY_ADDED_TO_READ',
  LACK_OF_ARTICLE_IN_TO_READ = 'LACK_OF_ARTICLE_IN_TO_READ',
  ARTICLE_DOES_NOT_EXIST = 'ARTICLE_DOES_NOT_EXIST',
  ARTICLE_HAS_BEEN_ALREADY_ADDED_READED = 'ARTICLE_HAS_BEEN_ALREADY_ADDED_READED',
  LACK_OF_ARTICLE_IN_READED = 'LACK_OF_ARTICLE_IN_READED',
  REGION_ALEADY_FOLLOWED = 'REGION_ALEADY_FOLLOWED',
  LACK_OF_REGION_IN_FOLLOWED = 'LACK_OF_REGION_IN_FOLLOWED',
  REGION_DOES_NOT_EXIST = 'REGION_DOES_NOT_EXIST',
  PUBLISHER_DOES_NOT_EXIST = 'PUBLISHER_DOES_NOT_EXIST',
  INCORRECT_2FA_CODE = 'INCORRECT_2FA_CODE',
  PUBLISHER_ALREADY_HAS_PASSWORD = 'PUBLISHER_ALREADY_HAS_PASSWORD',
  INITIAL_CODE_INCORRECT = 'INITIAL_CODE_INCORRECT',
  CAN_NOT_REPORT_OWN_ARTICLE = 'CAN_NOT_REPORT_OWN_ARTICLE',
  LACK_OF_ARTICLE_IN_REPORTED = 'LACK_OF_ARTICLE_IN_REPORTED',
  ARTICLE_HAS_NOT_BEEN_UPDATED = 'ARTICLE_HAS_NOT_BEEN_UPDATED',
  ARTICLE_HAS_NOT_BEEN_DELETED = 'ARTICLE_HAS_NOT_BEEN_DELETED',
  ARTICLE_HAS_NOT_BEEN_CREATED_OR_UPDATED = ' ARTICLE_HAS_NOT_BEEN_CREATED_OR_UPDATED',
  EMAIL_HAS_NOT_BEEN_SEND = 'EMAIL_HAS_NOT_BEEN_SEND',
  RAW_EMAIL_HAS_NOT_BEEN_SEND = 'RAW_EMAIL_HAS_NOT_BEEN_SEND',
  ADMIN_DOES_NOT_EXIST = 'ADMIN_DOES_NOT_EXIST',
  PUBLISHER_HAS_NOT_BEEN_UPDATED = 'PUBLISHER_HAS_NOT_BEEN_UPDATED',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_RESIZE_ERROR = 'FILE_RESIZE_ERROR',
  READER_HAS_NOT_KINDLE_EMAIL = 'READER_HAS_NOT_KINDLE_EMAIL',
  READER_HAS_NOT_POCKET_BOOK_EMAIL = 'READER_HAS_NOT_POCKET_BOOK_EMAIL',
  FACEBOOK_ERROR = 'FACEBOOK_ERROR',
  HAS_NOT_ACCESS = 'HAS_NOT_ACCESS',
  CAN_NOT_EDIT_OTHER_THAN_OWN = 'CAN_NOT_EDIT_OTHER_THAN_OWN',
}

export default ErrorCode;
