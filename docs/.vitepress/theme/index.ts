import mediumZoom from 'medium-zoom';
import { useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { nextTick, onMounted, watch } from 'vue';
import './custom.css';

const zoomImages = () => {
  const images: HTMLImageElement[] = [];
  document
    .querySelectorAll<HTMLImageElement>('img[data-zoomable]')
    .forEach((v) => {
      images.push(v);
    });
  document
    .querySelectorAll<HTMLImageElement>('img[src^="https://a.gkd.li/"]')
    .forEach((v) => {
      images.push(v);
    });

  for (const img of images) {
    if (!img.getAttribute('zoom-inited')) {
      img.setAttribute('zoom-inited', 'true');
      mediumZoom(img, { background: 'rgba(0,0,0,0.7)' });
    }
  }
};

export default {
  ...DefaultTheme,
  setup() {
    onMounted(zoomImages);
    const route = useRoute();
    watch(
      () => route.path,
      () => nextTick(zoomImages),
    );
  },
};
