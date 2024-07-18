'use strict';

function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { isSharedValue } from '../isSharedValue';
import { isChromeDebugger } from '../PlatformChecker';
import { WorkletEventHandler } from '../WorkletEventHandler';
import { initialUpdaterRun } from '../animation';
import { hasInlineStyles, getInlineStyle } from './InlinePropManager';
import { flattenArray, has } from './utils';
import { StyleSheet } from 'react-native';
function dummyListener() {
  // empty listener we use to assign to listener properties for which animated
  // event is used.
}
export class PropsFilter {
  constructor() {
    _defineProperty(this, "_initialStyle", {});
  }
  filterNonAnimatedProps(component) {
    const inputProps = component.props;
    const props = {};
    for (const key in inputProps) {
      const value = inputProps[key];
      if (key === 'style') {
        const styleProp = inputProps.style;
        const styles = flattenArray(styleProp ?? []);
        const processedStyle = styles.map(style => {
          if (style && style.viewDescriptors) {
            // this is how we recognize styles returned by useAnimatedStyle
            if (component._isFirstRender) {
              this._initialStyle = {
                ...style.initial.value,
                ...this._initialStyle,
                ...initialUpdaterRun(style.initial.updater)
              };
            }
            return this._initialStyle;
          } else if (hasInlineStyles(style)) {
            return getInlineStyle(style, component._isFirstRender);
          } else {
            return style;
          }
        });
        props[key] = StyleSheet.flatten(processedStyle);
      } else if (key === 'animatedProps') {
        const animatedProp = inputProps.animatedProps;
        if (animatedProp.initial !== undefined) {
          Object.keys(animatedProp.initial.value).forEach(initialValueKey => {
            var _animatedProp$initial;
            props[initialValueKey] = (_animatedProp$initial = animatedProp.initial) === null || _animatedProp$initial === void 0 ? void 0 : _animatedProp$initial.value[initialValueKey];
          });
        }
      } else if (has('workletEventHandler', value) && value.workletEventHandler instanceof WorkletEventHandler) {
        if (value.workletEventHandler.eventNames.length > 0) {
          value.workletEventHandler.eventNames.forEach(eventName => {
            props[eventName] = has('listeners', value.workletEventHandler) ? value.workletEventHandler.listeners[eventName] : dummyListener;
          });
        } else {
          props[key] = dummyListener;
        }
      } else if (isSharedValue(value)) {
        if (component._isFirstRender) {
          props[key] = value.value;
        }
      } else if (key !== 'onGestureHandlerStateChange' || !isChromeDebugger()) {
        props[key] = value;
      }
    }
    return props;
  }
}
//# sourceMappingURL=PropsFilter.js.map