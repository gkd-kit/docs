import { defineComponent, h } from 'vue';
import { DefaultSlotCpt, defineVitePressComponent } from '../utils/async';

const imageProps = [
  'alt',
  'height',
  'imgProps',
  'previewedImgProps',
  'lazy',
  'intersectionObserverOptions',
  'objectFit',
  'previewSrc',
  'fallbackSrc',
  'width',
  'src',
  'previewDisabled',
  'loadDescription',
  'onError',
  'onLoad',
  'theme',
  'themeOverrides',
  'builtinThemeOverrides',
  'onPreviewPrev',
  'onPreviewNext',
  'showToolbar',
  'showToolbarTooltip',
  'renderToolbar',
];

const FakeNImage = defineComponent(
  (props, ctx) => {
    return () => {
      return h('div', { class: 'n-image' }, h('img', props, ctx.slots));
    };
  },
  { props: imageProps },
);

export const NImage = defineVitePressComponent({
  loader: () => import('naive-ui/es/image').then((m) => m.NImage),
  placeholder: FakeNImage,
  props: imageProps,
});

export const NImageGroup = defineVitePressComponent({
  loader: () => import('naive-ui/es/image').then((m) => m.NImageGroup),
  placeholder: DefaultSlotCpt,
});

const naiveComponents = {
  NImage,
  NImageGroup,
};

export default naiveComponents;
