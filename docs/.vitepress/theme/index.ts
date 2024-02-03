import mediumZoom from 'medium-zoom';
import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import './custom.css';

const zoomImages = () => {
  const images: HTMLImageElement[] = [];
  document
    .querySelectorAll<HTMLImageElement>('img[data-zoomable]')
    .forEach((v) => {
      images.push(v);
    });
  document
    .querySelectorAll<HTMLImageElement>(
      'img[src^="https://a.gkd.li/"]',
    )
    .forEach((v) => {
      images.push(v);
    });

  for (const img of images) {
    if (!img.getAttribute('zoom-inited')) {
      img.setAttribute('zoom-inited', 'true');
      // https://github.com/vuejs/vitepress/issues/854#issuecomment-1232938474
      mediumZoom(img, { background: 'rgba(0,0,0,0.7)' });
    }
  }
};

export default {
  ...DefaultTheme,
  setup() {
    let task = 0;
    onMounted(() => {
      zoomImages();
      task = window.setInterval(zoomImages, 3000);
    });
    onUnmounted(() => {
      task && window.clearInterval(task);
    });
  },
};
