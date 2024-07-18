import { PointerType } from '../PointerType';
export function isPointerInBounds(view, {
  x,
  y
}) {
  const rect = view.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
export const PointerTypeMapping = new Map([['mouse', PointerType.MOUSE], ['touch', PointerType.TOUCH], ['pen', PointerType.STYLUS], ['none', PointerType.OTHER]]);
export const degToRad = degrees => degrees * Math.PI / 180;
export const coneToDeviation = degrees => Math.cos(degToRad(degrees / 2));
export function calculateViewScale(view) {
  var _RegExp$exec;

  const styles = getComputedStyle(view);
  const resultScales = {
    scaleX: 1,
    scaleY: 1
  };
  const scales = styles.scale.split(' ');

  if (scales[0] !== 'none') {
    resultScales.scaleX = parseFloat(scales[0]);
  }

  if (scales[1]) {
    resultScales.scaleY = parseFloat(scales[1]);
  }

  const matrixElements = (_RegExp$exec = new RegExp(/matrix\((.+)\)/).exec(styles.transform)) === null || _RegExp$exec === void 0 ? void 0 : _RegExp$exec[1];

  if (!matrixElements) {
    return resultScales;
  }

  const matrixElementsArray = matrixElements.split(', ');
  resultScales.scaleX *= parseFloat(matrixElementsArray[0]);
  resultScales.scaleY *= parseFloat(matrixElementsArray[3]);
  return resultScales;
}
//# sourceMappingURL=utils.js.map