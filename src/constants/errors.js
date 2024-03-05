
class PayloadTooLargeException extends Error {
  constructor(message = 'Payload Too Large') {
    super(message);
    this.name = 'File count limit exceeded';
    this.status = 413;
  }
}

module.exports = { PayloadTooLargeException };