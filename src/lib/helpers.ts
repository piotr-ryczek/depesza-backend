import { Types } from 'mongoose';

export const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
