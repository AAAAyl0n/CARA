import type { MutableRefObject } from 'react';
import type { SharedValue, StyleProps } from './commonTypes';
import type { AnimatedStyle } from './helperTypes';
import type { Descriptor } from './hook/commonTypes';
declare let updateProps: (viewDescriptor: SharedValue<Descriptor[]>, updates: StyleProps | AnimatedStyle<any>, isAnimatedProps?: boolean) => void;
export declare const updatePropsJestWrapper: (viewDescriptors: SharedValue<Descriptor[]>, updates: AnimatedStyle<any>, animatedStyle: MutableRefObject<AnimatedStyle<any>>, adapters: ((updates: AnimatedStyle<any>) => void)[]) => void;
export default updateProps;
export interface UpdatePropsManager {
    update(viewDescriptors: SharedValue<Descriptor[]>, updates: StyleProps | AnimatedStyle<any>): void;
    flush(): void;
}
