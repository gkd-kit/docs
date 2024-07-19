import type { Component } from 'vue';
import { defineComponent, h, onMounted, shallowRef, nextTick } from 'vue';

export const DefaultSlotCpt = defineComponent((_, ctx) => {
  return () => {
    return ctx.slots.default?.();
  };
});

export const defineVitePressComponent = <T extends Component>(source: {
  loader: () => Promise<T>;
  placeholder: Component;
  props?: string[];
}): T => {
  if (!import.meta.env.SSR) {
    source.loader();
  }
  return defineComponent(
    (props, ctx) => {
      const component = shallowRef<T>();
      if (!import.meta.env.SSR) {
        if (!component.value) {
          source.loader().then((m) => {
            component.value = m;
          });
        }
      }
      return () => {
        if (component.value) {
          return h(component.value, props, ctx.slots);
        }
        return h(source.placeholder, props, ctx.slots);
      };
    },
    {
      props: source.props,
    },
  ) as T;
};
