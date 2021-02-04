export const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const getRandomCode = (digits: number): string => {
  return Array.from(Array(digits).keys())
    .map(() => Math.floor(Math.random() * 10))
    .join(''); // TODO: When newer Node version change into randomInt()
};
