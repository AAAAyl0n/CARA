"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dropHandlers = dropHandlers;

var _handlersRegistry = require("../../handlersRegistry");

var _RNGestureHandlerModule = _interopRequireDefault(require("../../../RNGestureHandlerModule"));

var _gestureHandlerCommon = require("../../gestureHandlerCommon");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dropHandlers(preparedGesture) {
  for (const handler of preparedGesture.attachedGestures) {
    _RNGestureHandlerModule.default.dropGestureHandler(handler.handlerTag);

    (0, _handlersRegistry.unregisterHandler)(handler.handlerTag, handler.config.testId);
  }

  (0, _gestureHandlerCommon.scheduleFlushOperations)();
}
//# sourceMappingURL=dropHandlers.js.map