import type {
  AsyncComponentOptions,
  Component,
  ComponentPublicInstance,
} from 'vue';
import { defineAsyncComponent, defineComponent } from 'vue';

export const DefaultSlotCpt = defineComponent((_, ctx) => {
  return () => {
    return ctx.slots.default?.();
  };
});

export const defineVitePressAsyncComponent = <
  T extends Component = {
    new (): ComponentPublicInstance;
  },
>(
  source: AsyncComponentOptions<T>,
): T => {
  if (import.meta.env.SSR) {
    return (source.loadingComponent || DefaultSlotCpt) as T;
  } else {
    source.loader();
    return defineAsyncComponent(source);
  }
};
