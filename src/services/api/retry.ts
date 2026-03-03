export const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 500
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;

    await new Promise(res => setTimeout(res, delay));

    return retryRequest(fn, retries - 1, delay * 2);
  }
};