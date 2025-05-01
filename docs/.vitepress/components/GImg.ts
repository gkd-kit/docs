import { computed, defineComponent, h, shallowReactive } from 'vue';
import { NImage } from './naive';
import { imageSizeList } from '../data/mirror.load';
import { convertSrc } from '../utils/img';

const imgLoadMap = shallowReactive<Record<string, string | boolean>>({});

const preLoadImg = async (url: string) => {
  const img = new Image();
  img.src = url;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
  });
  imgLoadMap[url] = true;
  // const r = await fetch(url);
  // const b = await r.blob();
  // imgLoadMap[url] = URL.createObjectURL(b);
};

const getImgPlaceholderUrl = (url: string): string => {
  if (!import.meta.env.SSR) {
    preLoadImg(url);
  }
  const size = imageSizeList.find((i) => url.endsWith(i.name));
  if (!size) {
    console.error(`Image size not found for ${url}`);
    return url;
  }
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}"></svg>`,
    )
  );
};

const GImg = defineComponent<{
  src: string;
}>(
  (props, ctx) => {
    const rawSrc = computed(() => convertSrc(props.src));
    const src = computed(() => {
      const u = imgLoadMap[rawSrc.value];
      if (u === true) {
        return rawSrc.value;
      }
      if (typeof u === 'string') {
        return u;
      }
      return getImgPlaceholderUrl(rawSrc.value);
    });
    return () => {
      return h(NImage, {
        src: src.value,
        'data-src': rawSrc.value,
        ...ctx.attrs,
      });
    };
  },
  {
    props: ['src'],
  },
);

export default GImg;
