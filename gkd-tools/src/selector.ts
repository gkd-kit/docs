import { createDefaultSelectorTypeModel, Selector } from '@gkd-kit/selector';

const typeModel = createDefaultSelectorTypeModel();

export const parseSelector = (source: string): Selector => {
  const selector = Selector.compile(source).value;
  const [error] = selector.getTypeErrors(typeModel);
  if (error) throw error;
  return selector;
};
