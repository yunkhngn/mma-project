import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const { width } = Dimensions.get('window');

// User-friendly error message translator
const translateErrorMessage = (msg: string): string => {
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
    return 'Email này đã được sử dụng. Vui lòng dùng một email khác hoặc đăng nhập.';
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
  if (cleanMsg.includes('users_email_key')) {
    return 'Email này đã được đăng ký bởi một tài khoản khác.';
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

  // Default Fallbacks
  return msg || 'Đã xảy ra lỗi hệ thống không xác định. Vui lòng thử lại sau.';
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: ToastType, duration = 4000) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Always translate errors to a user-friendly version
    const finalMessage = type === 'error' ? translateErrorMessage(message) : message;

    setToast({ message: finalMessage, type, duration });

    // Animate in with smooth spring physics
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: Platform.OS === 'web' ? 24 : 54,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      dismissToast();
    }, duration);
  };

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  };

  const showSuccess = (message: string, duration?: number) => showToast(message, 'success', duration);
  const showError = (message: string, duration?: number) => showToast(message, 'error', duration);
  const showInfo = (message: string, duration?: number) => showToast(message, 'info', duration);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Icon selector helper with modern white icons for premium contrast
  const renderIcon = (type: ToastType) => {
    const iconSize = 20;
    switch (type) {
      case 'success':
        return <CheckCircle2 size={iconSize} color="#ffffff" />;
      case 'error':
        return <AlertCircle size={iconSize} color="#ffffff" />;
      case 'info':
        return <Info size={iconSize} color="#ffffff" />;
    }
  };

  // Modern solid-color themes designed to pop against any background
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-600 border-emerald-700 shadow-emerald-950/20',
          text: 'text-white',
        };
      case 'error':
        return {
          bg: 'bg-rose-600 border-rose-700 shadow-rose-950/20',
          text: 'text-white',
        };
      case 'info':
        return {
          bg: 'bg-slate-800 border-slate-900 shadow-slate-950/20',
          text: 'text-white',
        };
    }
  };

  const toastStyle = toast ? getToastStyles(toast.type) : null;

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {toast && toastStyle && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          className={`flex-row items-center justify-between border px-4 py-3.5 rounded-2xl ${toastStyle.bg}`}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <View className="mr-3 flex-shrink-0">{renderIcon(toast.type)}</View>
            <View className="flex-1">
              <Text className={`font-semibold text-[13px] sm:text-[14px] leading-snug ${toastStyle.text}`}>
                {toast.message}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={dismissToast} className="p-1 rounded-full active:bg-white/10 flex-shrink-0">
            <X size={16} color="#ffffff" style={{ opacity: 0.8 }} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'auto',
    width: Platform.OS === 'web' ? width - 32 : undefined,
  },
});
