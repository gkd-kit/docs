import ApkTable from './ApkTable.vue';
import GImg from './GImg';
import IdentifierField from './IdentifierField.vue';
import ImageTable from './ImageTable.vue';
import naiveComponents from './naive';
import GkdOnly from './GkdOnly.vue';
import MobileOnly from './MobileOnly.vue';

export default {
  ...naiveComponents,
  GImg,
  ImageTable,
  IdentifierField,
  ApkTable,
  GkdOnly,
  MobileOnly,
};
