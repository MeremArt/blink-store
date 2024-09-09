export default class CustomApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}
