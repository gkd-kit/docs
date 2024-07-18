import { defineComponent,h } from 'vue'; 
import { DefaultSlotCpt, defineVitePressAsyncComponent } from './async';

const ImgCpt = defineComponent(
  (props, ctx) => {
    return () => {
      return h('img', { ...ctx.attrs, ...props });
    };
  },
  { props: ['src'] },
);

export const NImage = defineVitePressAsyncComponent({
  loader: () => import('naive-ui/es/image').then((m) => m.NImage),
  loadingComponent: ImgCpt,
});

export const NImageGroup = defineVitePressAsyncComponent({
  loader: () => import('naive-ui/es/image').then((m) => m.NImageGroup),
  loadingComponent: DefaultSlotCpt,
});
