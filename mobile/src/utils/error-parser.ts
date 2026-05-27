/**
 * Utility to parse complex or raw error messages (Firebase, database, network, API)
 * into friendly, conversational Vietnamese messages for users.
 */
export const parseError = (error: any): string => {
  if (!error) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';

  // Extract the raw message string
  let msg = '';
  if (typeof error === 'string') {
    msg = error;
  } else if (error.message && typeof error.message === 'string') {
    msg = error.message;
  } else if (error.code && typeof error.code === 'string') {
    msg = error.code;
  } else {
    msg = String(error);
  }

  const cleanMsg = msg.toLowerCase();

  // Firebase Auth Error Codes
  if (cleanMsg.includes('auth/invalid-email') || cleanMsg.includes('invalid email')) {
    return 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại định dạng (ví dụ: abc@gmail.com).';
  }
  if (cleanMsg.includes('auth/wrong-password') || cleanMsg.includes('wrong password')) {
    return 'Mật khẩu không chính xác. Vui lòng nhập lại.';
  }
  if (cleanMsg.includes('auth/user-not-found') || cleanMsg.includes('user not found')) {
    return 'Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới.';
  }
  if (cleanMsg.includes('auth/invalid-credential') || cleanMsg.includes('invalid-credential') || cleanMsg.includes('invalid credential')) {
    return 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
  }
  if (cleanMsg.includes('auth/email-already-in-use') || cleanMsg.includes('email already in use') || cleanMsg.includes('email-already-in-use')) {
    return 'Email này đã được đăng ký bởi một tài khoản khác. Vui lòng thử đăng nhập.';
  }
  if (cleanMsg.includes('auth/weak-password') || cleanMsg.includes('weak password')) {
    return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mới mạnh hơn (tối thiểu 8 ký tự).';
  }
  if (cleanMsg.includes('auth/too-many-requests') || cleanMsg.includes('too many requests')) {
    return 'Hệ thống phát hiện quá nhiều lần thử sai. Tài khoản đã bị tạm khóa. Vui lòng thử lại sau ít phút.';
  }
  if (cleanMsg.includes('auth/popup-closed-by-user') || cleanMsg.includes('popup closed by user')) {
    return 'Cửa sổ đăng nhập Google đã đóng. Vui lòng thử lại nếu bạn muốn tiếp tục.';
  }
  if (cleanMsg.includes('auth/cancelled-popup-request') || cleanMsg.includes('cancelled popup')) {
    return 'Yêu cầu đăng nhập đã bị hủy.';
  }
  if (cleanMsg.includes('network-request-failed') || cleanMsg.includes('network request failed')) {
    return 'Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền internet của bạn.';
  }

  // Database / Backend Constraints & Roles
  if (cleanMsg.includes('users_email_key') || cleanMsg.includes('unique constraint failed on the constraint: `users_email_key`')) {
    return 'Email này đã được sử dụng bởi một tài khoản khác.';
  }
  if (cleanMsg.includes('users_firebase_uid_key')) {
    return 'Tài khoản của bạn đã được liên kết với một ID khác trên hệ thống.';
  }
  if (cleanMsg.includes('unauthorized') || cleanMsg.includes('401')) {
    return 'Quyền truy cập không hợp lệ. Vui lòng kiểm tra lại quyền hạn tài khoản.';
  }
  if (cleanMsg.includes('table') && cleanMsg.includes('does not exist')) {
    return 'Hệ thống cơ sở dữ liệu chưa được đồng bộ hoàn toàn. Vui lòng liên hệ quản trị viên.';
  }

  // Default Fallback
  return msg || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
};
