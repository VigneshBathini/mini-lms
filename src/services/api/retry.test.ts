import { retryRequest } from './retry';

describe('retryRequest', () => {
  it('retries failed calls and eventually resolves', async () => {
    let attempts = 0;
    const fn = jest.fn(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('temporary');
      }
      return 'ok';
    });

    const result = await retryRequest(fn, 2, 1);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after retries are exhausted', async () => {
    const fn = jest.fn(async () => {
      throw new Error('permanent');
    });

    await expect(retryRequest(fn, 1, 1)).rejects.toThrow('permanent');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
