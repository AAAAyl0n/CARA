"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateHandlers = updateHandlers;

var _handlersRegistry = require("../../handlersRegistry");

var _RNGestureHandlerModule = _interopRequireDefault(require("../../../RNGestureHandlerModule"));

var _gestureHandlerCommon = require("../../gestureHandlerCommon");

var _ghQueueMicrotask = require("../../../ghQueueMicrotask");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateHandlers(preparedGesture, gestureConfig, newGestures) {
  gestureConfig.prepare();

  for (let i = 0; i < newGestures.length; i++) {
    const handler = preparedGesture.attachedGestures[i];
    (0, _utils.checkGestureCallbacksForWorklets)(handler); // only update handlerTag when it's actually different, it may be the same
    // if gesture config object is wrapped with useMemo

    if (newGestures[i].handlerTag !== handler.handlerTag) {
      newGestures[i].handlerTag = handler.handlerTag;
      newGestures[i].handlers.handlerTag = handler.handlerTag;
    }
  } // use queueMicrotask to extract handlerTags, because when it's ran, all refs should be updated
  // and handlerTags in BaseGesture references should be updated in the loop above (we need to wait
  // in case of external relations)


  (0, _ghQueueMicrotask.ghQueueMicrotask)(() => {
    if (!preparedGesture.isMounted) {
      return;
    }

    for (let i = 0; i < newGestures.length; i++) {
      const handler = preparedGesture.attachedGestures[i];
      handler.config = newGestures[i].config;
      handler.handlers = newGestures[i].handlers;

      _RNGestureHandlerModule.default.updateGestureHandler(handler.handlerTag, (0, _gestureHandlerCommon.filterConfig)(handler.config, _utils.ALLOWED_PROPS, (0, _utils.extractGestureRelations)(handler)));

      (0, _handlersRegistry.registerHandler)(handler.handlerTag, handler, handler.config.testId);
    }

    if (preparedGesture.animatedHandlers) {
      var _preparedGesture$anim;

      const previousHandlersValue = (_preparedGesture$anim = preparedGesture.animatedHandlers.value) !== null && _preparedGesture$anim !== void 0 ? _preparedGesture$anim : [];
      const newHandlersValue = preparedGesture.attachedGestures.filter(g => g.shouldUseReanimated) // ignore gestures that shouldn't run on UI
      .map(g => g.handlers); // if amount of gesture configs changes, we need to update the callbacks in shared value

      let shouldUpdateSharedValue = previousHandlersValue.length !== newHandlersValue.length;

      if (!shouldUpdateSharedValue) {
        // if the amount is the same, we need to check if any of the configs inside has changed
        for (let i = 0; i < newHandlersValue.length; i++) {
          if ( // we can use the `gestureId` prop as it's unique for every config instance
          newHandlersValue[i].gestureId !== previousHandlersValue[i].gestureId) {
            shouldUpdateSharedValue = true;
            break;
          }
        }
      }

      if (shouldUpdateSharedValue) {
        preparedGesture.animatedHandlers.value = newHandlersValue;
      }
    }

    (0, _gestureHandlerCommon.scheduleFlushOperations)();
  });
}
//# sourceMappingURL=updateHandlers.js.map