declare module '*.css';
declare module '*.module.css';

declare module 'firebase/auth/react-native' {
    import { Persistence } from 'firebase/auth';
    export function getReactNativePersistence(storage: any): Persistence;
}
