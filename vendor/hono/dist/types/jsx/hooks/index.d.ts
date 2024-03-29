type UpdateStateFunction<T> = (newState: T | ((currentState: T) => T)) => void;
export declare const STASH_EFFECT = 1;
export type EffectData = [
    readonly unknown[] | undefined,
    // deps
    (() => void | (() => void)) | undefined,
    // layout effect
    (() => void) | undefined,
    // cleanup
    (() => void) | undefined
];
export declare const startViewTransition: (callback: () => void) => void;
export declare const useViewTransition: () => [boolean, (callback: () => void) => void];
export declare const startTransition: (callback: () => void) => void;
export declare const useTransition: () => [boolean, (callback: () => void) => void];
export declare const useDeferredValue: <T>(value: T) => T;
export declare const useState: <T>(initialState: T | (() => T)) => [T, UpdateStateFunction<T>];
export declare const useEffect: (effect: () => void | (() => void), deps?: readonly unknown[]) => void;
export declare const useLayoutEffect: (effect: () => void | (() => void), deps?: readonly unknown[]) => void;
export declare const useCallback: <T extends (...args: unknown[]) => unknown>(callback: T, deps: readonly unknown[]) => T;
export type RefObject<T> = {
    current: T | null;
};
export declare const useRef: <T>(initialValue: T | null) => RefObject<T>;
export declare const use: <T>(promise: Promise<T>) => T;
export declare const useMemo: <T>(factory: () => T, deps: readonly unknown[]) => T;
export {};
