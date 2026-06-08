/**
 * Translates technical error codes and raw API messages into clean, user-friendly Vietnamese text.
 */
export const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return 'Đã xảy ra lỗi. Vui lòng thử lại.';

  // If error is just a string, check its contents
  const messageStr = typeof error === 'string' ? error : (error.message || error.code || '');
  const code = error?.code || '';

  // Firebase Authentication Errors
  if (
    code.includes('invalid-credential') ||
    code.includes('wrong-password') ||
    code.includes('user-not-found') ||
    messageStr.includes('invalid-credential') ||
    messageStr.includes('wrong-password') ||
    messageStr.includes('user-not-found')
  ) {
    return 'Email hoặc mật khẩu không chính xác.';
  }

  if (code.includes('email-already-in-use') || messageStr.includes('email-already-in-use')) {
    return 'Địa chỉ email này đã được sử dụng bởi một tài khoản khác.';
  }

  if (code.includes('invalid-email') || messageStr.includes('invalid-email')) {
    return 'Định dạng địa chỉ email không hợp lệ.';
  }

  if (code.includes('weak-password') || messageStr.includes('weak-password')) {
    return 'Mật khẩu quá yếu. Vui lòng đặt mật khẩu từ 8 ký tự trở lên.';
  }

  if (
    code.includes('network-request-failed') ||
    messageStr.includes('network-request-failed') ||
    messageStr.includes('Network request failed')
  ) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối internet.';
  }

  if (code.includes('too-many-requests') || messageStr.includes('too-many-requests')) {
    return 'Tài khoản của bạn đã bị khóa tạm thời do nhập sai nhiều lần. Vui lòng thử lại sau.';
  }

  if (code.includes('user-disabled') || messageStr.includes('user-disabled')) {
    return 'Tài khoản này đã bị vô hiệu hóa.';
  }

  if (code.includes('operation-not-allowed') || messageStr.includes('operation-not-allowed')) {
    return 'Phương thức đăng nhập này chưa được kích hoạt.';
  }

  // Handle generic error text
  if (messageStr) {
    // If the message is already friendly and in Vietnamese, return it
    const isVietnamese = /[\u00C0-\u1EF9]/.test(messageStr);
    if (isVietnamese) return messageStr;
  }

  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
};
