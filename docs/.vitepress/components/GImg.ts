import { defineComponent, h } from 'vue';
import { NImage } from './naive';
import { convertSrc } from '../utils/img';

const GImg = defineComponent<{
  src: string;
  width?: number | string;
}>(
  (props) => {
    return () => {
      return h(NImage, {
        src: convertSrc(props.src),
        width: props.width,
      });
    };
  },
  {
    props: ['src', 'width'],
  },
);

export default GImg;
