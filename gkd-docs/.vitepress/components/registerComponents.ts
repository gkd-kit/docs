import type { App } from 'vue';
import GkApkTable from './GkApkTable.vue';
import GkIdentifierField from './GkIdentifierField.vue';
import GkImage from './GkImage.vue';
import GkImagePreviewGroup from './GkImagePreviewGroup.vue';
import GkImageTable from './GkImageTable.vue';
import GkInAppOnly from './GkInAppOnly.vue';
import GkMobileOnly from './GkMobileOnly.vue';

export const registerComponents = (app: App): void => {
  app.component('GkApkTable', GkApkTable);
  app.component('GkIdentifierField', GkIdentifierField);
  app.component('GkImage', GkImage);
  app.component('GkImagePreviewGroup', GkImagePreviewGroup);
  app.component('GkImageTable', GkImageTable);
  app.component('GkInAppOnly', GkInAppOnly);
  app.component('GkMobileOnly', GkMobileOnly);
};
