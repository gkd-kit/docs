import { defineComponent, h } from 'vue';
import { DefaultSlotCpt, defineVitePressAsyncComponent } from '../utils/async';

const FakeNImage = defineComponent(
  (props, ctx) => {
    return () => {
      return h(
        'div',
        { class: 'n-image' },
        h('img', { ...ctx.attrs, ...props }),
      );
    };
  },
  { props: ['src'] },
);

export const NImage = defineVitePressAsyncComponent({
  loader: () => import('naive-ui/es/image').then((m) => m.NImage),
  loadingComponent: FakeNImage,
});

export const NImageGroup = defineVitePressAsyncComponent({
  loader: () => import('naive-ui/es/image').then((m) => m.NImageGroup),
  loadingComponent: DefaultSlotCpt,
});

const naiveComponents = {
  NImage,
  NImageGroup,
};

export default naiveComponents;
