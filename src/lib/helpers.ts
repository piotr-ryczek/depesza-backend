import { Types } from 'mongoose';
import * as cheerio from 'cheerio';

import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';

export const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const fileExtensionRegexp = /(?:\.([^.]+))?$/;

export const getRandomCode = (digits: number): string => {
  return Array.from(Array(digits).keys())
    .map(() => Math.floor(Math.random() * 10))
    .join('');
};

export const objectIdsIncludes = (
  itemsArray: Types.ObjectId[],
  value: string,
) => {
  const valueObjectId = new Types.ObjectId(value);

  return itemsArray.some((item) => item.equals(valueObjectId));
};

export const filterObjectIdsFrom = (itemsArray: Types.ObjectId[], value) => {
  const valueObjectId = new Types.ObjectId(value);

  return itemsArray.filter((item) => !item.equals(valueObjectId));
};

export const validatePassword = (password, repeatPassword) => {
  const validationErrors = [];

  if (password.length < 8) {
    validationErrors.push({
      field: 'password',
      message: ErrorCode.PASSWORD_TOO_SHORT,
    });
  }

  if (password !== repeatPassword) {
    validationErrors.push({
      field: 'repeatPassword',
      message: ErrorCode.PASSWORDS_DOES_NOT_MATCH,
    });
  }

  return validationErrors;
};

/**
 *
 * @description
 * Accepted tags: h1, h2, h3, h4, h5, h6, p, ul, ol, li, a, img, figure, figcaption, div
 * Possibly accepted tags: table, blockquote
 */
export const cleanupHTML = (html) => {
  const $ = cheerio.load(html);

  $('*')
    .contents()
    .filter((index, node) => node.type === 'comment') // Removing comments
    .remove();
  // Removing unaccepted tags
  $(
    'dt, dl, dd, form, caption, canvas, input, button, article, address, abbr, area, aside, base, col, code, data, datalist, frame, iframe, head, header, ins, map, main, mark, pre, rp, rt, script, source, style, sub, summary, svg, textarea, track, video',
  ).remove();

  // Cleaning up from attributes
  $('*')
    .not('img')
    .each(function () {
      this.attribs = {};
    });

  $('figure').replaceWith(function () {
    return $($(this).html());
  });

  $('img').wrap('<figure />');

  const result = $('body').html();

  return result;
};
