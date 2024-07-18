'use strict';

import { _updatePropsJS } from '../js-reanimated';
export function setNativeProps(animatedRef, updates) {
  const component = animatedRef();
  _updatePropsJS(updates, component);
}
//# sourceMappingURL=setNativeProps.web.js.map