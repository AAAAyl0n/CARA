'use strict';

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
import { has } from './utils';
import { WorkletEventHandler } from '../WorkletEventHandler';
import { findNodeHandle } from 'react-native';
var _managedComponent = /*#__PURE__*/new WeakMap();
var _componentOptions = /*#__PURE__*/new WeakMap();
var _eventViewTag = /*#__PURE__*/new WeakMap();
export class NativeEventsManager {
  constructor(component, options) {
    _classPrivateFieldInitSpec(this, _managedComponent, void 0);
    _classPrivateFieldInitSpec(this, _componentOptions, void 0);
    _classPrivateFieldInitSpec(this, _eventViewTag, -1);
    _classPrivateFieldSet(_managedComponent, this, component);
    _classPrivateFieldSet(_componentOptions, this, options);
    _classPrivateFieldSet(_eventViewTag, this, this.getEventViewTag());
  }
  attachEvents() {
    executeForEachEventHandler(_classPrivateFieldGet(_managedComponent, this).props, (key, handler) => {
      handler.registerForEvents(_classPrivateFieldGet(_eventViewTag, this), key);
    });
  }
  detachEvents() {
    executeForEachEventHandler(_classPrivateFieldGet(_managedComponent, this).props, (_key, handler) => {
      handler.unregisterFromEvents(_classPrivateFieldGet(_eventViewTag, this));
    });
  }
  updateEvents(prevProps) {
    const computedEventTag = this.getEventViewTag();
    // If the event view tag changes, we need to completely re-mount all events
    if (_classPrivateFieldGet(_eventViewTag, this) !== computedEventTag) {
      // Remove all bindings from previous props that ran on the old viewTag
      executeForEachEventHandler(prevProps, (_key, handler) => {
        handler.unregisterFromEvents(_classPrivateFieldGet(_eventViewTag, this));
      });
      // We don't need to unregister from current (new) props, because their events weren't registered yet
      // Replace the view tag
      _classPrivateFieldSet(_eventViewTag, this, computedEventTag);
      // Attach the events with a new viewTag
      this.attachEvents();
      return;
    }
    executeForEachEventHandler(prevProps, (key, prevHandler) => {
      const newProp = _classPrivateFieldGet(_managedComponent, this).props[key];
      if (!newProp) {
        // Prop got deleted
        prevHandler.unregisterFromEvents(_classPrivateFieldGet(_eventViewTag, this));
      } else if (isWorkletEventHandler(newProp) && newProp.workletEventHandler !== prevHandler) {
        // Prop got changed
        prevHandler.unregisterFromEvents(_classPrivateFieldGet(_eventViewTag, this));
        newProp.workletEventHandler.registerForEvents(_classPrivateFieldGet(_eventViewTag, this));
      }
    });
    executeForEachEventHandler(_classPrivateFieldGet(_managedComponent, this).props, (key, handler) => {
      if (!prevProps[key]) {
        // Prop got added
        handler.registerForEvents(_classPrivateFieldGet(_eventViewTag, this));
      }
    });
  }
  getEventViewTag() {
    // Get the tag for registering events - since the event emitting view can be nested inside the main component
    const componentAnimatedRef = _classPrivateFieldGet(_managedComponent, this)._component;
    let newTag;
    if (componentAnimatedRef.getScrollableNode) {
      const scrollableNode = componentAnimatedRef.getScrollableNode();
      newTag = findNodeHandle(scrollableNode) ?? -1;
    } else {
      var _classPrivateFieldGet2;
      newTag = findNodeHandle((_classPrivateFieldGet2 = _classPrivateFieldGet(_componentOptions, this)) !== null && _classPrivateFieldGet2 !== void 0 && _classPrivateFieldGet2.setNativeProps ? _classPrivateFieldGet(_managedComponent, this) : componentAnimatedRef) ?? -1;
    }
    return newTag;
  }
}
function isWorkletEventHandler(prop) {
  return has('workletEventHandler', prop) && prop.workletEventHandler instanceof WorkletEventHandler;
}
function executeForEachEventHandler(props, callback) {
  for (const key in props) {
    const prop = props[key];
    if (isWorkletEventHandler(prop)) {
      callback(key, prop.workletEventHandler);
    }
  }
}
//# sourceMappingURL=NativeEventsManager.js.map