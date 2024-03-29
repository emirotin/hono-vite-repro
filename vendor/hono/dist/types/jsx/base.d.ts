import type { StringBuffer, HtmlEscaped, HtmlEscapedString } from '../utils/html';
import type { Context } from './context';
import type { IntrinsicElements as IntrinsicElementsDefined } from './intrinsic-elements';
export type Props = Record<string, any>;
export type FC<T = Props> = (props: T) => HtmlEscapedString | Promise<HtmlEscapedString>;
declare global {
    namespace JSX {
        type Element = HtmlEscapedString | Promise<HtmlEscapedString>;
        interface ElementChildrenAttribute {
            children: Child;
        }
        interface IntrinsicElements extends IntrinsicElementsDefined {
            [tagName: string]: Props;
        }
    }
}
type LocalContexts = [Context<unknown>, unknown][];
export type Child = string | Promise<string> | number | JSXNode | Child[];
export declare class JSXNode implements HtmlEscaped {
    tag: string | Function;
    props: Props;
    key?: string;
    children: Child[];
    isEscaped: true;
    localContexts?: LocalContexts;
    constructor(tag: string | Function, props: Props, children: Child[]);
    toString(): string | Promise<string>;
    toStringToBuffer(buffer: StringBuffer): void;
}
export declare class JSXFragmentNode extends JSXNode {
    toStringToBuffer(buffer: StringBuffer): void;
}
export declare const jsx: (tag: string | Function, props: Props, ...children: (string | HtmlEscapedString)[]) => JSXNode;
export declare const jsxFn: (tag: string | Function, props: Props, children: (string | HtmlEscapedString)[]) => JSXNode;
export declare const memo: <T>(component: FC<T>, propsAreEqual?: (prevProps: Readonly<T>, nextProps: Readonly<T>) => boolean) => FC<T>;
export declare const Fragment: ({ children, }: {
    key?: string | undefined;
    children?: HtmlEscapedString | Child | undefined;
}) => HtmlEscapedString;
export declare const isValidElement: (element: unknown) => element is JSXNode;
export declare const cloneElement: <T extends JSXNode | JSX.Element>(element: T, props: Partial<Props>, ...children: Child[]) => T;
export {};
