export type Coordinate = readonly [x: number, y: number];
export type Segment = readonly [start: Coordinate, end: Coordinate];

/**
 * Return the signed area of a polygon.
 *
 * If the returned value is:
 *
 *  - 0; the points are along a line,
 *  - < 0; the points are in a clockwise order,
 *  - > 0; the points are in a counter-clockwise order.
 *
 * @see https://en.wikipedia.org/wiki/Shoelace_formula#Shoelace_formula
 */
export const signedPolygonArea = (points: Coordinate[]) => {
  if (points.length < 3) {
    return 0;
  }

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - y1 * x2;
  }
  return 0.5 * area;
};

/**
 * Test whether or not a given segment crosses through a rectangle.
 *
 * @param point - the point to test.
 * @param rectangle - the rectangle, defined by its vertices.
 *
 * @returns `true` if the point is inside the rectangle, `false` otherwise.
 */
export const segmentIntersectsRectangle = ([a, b]: Segment, topLeft: Coordinate, bottomRight: Coordinate) => {
  const [startX, startY] = a;
  const [endX, endY] = b;
  const [rectMinX, rectMinY] = topLeft;
  const [rectMaxX, rectMaxY] = bottomRight;
  return (
    Math.max(startX, endX) > rectMinX &&
    Math.min(startX, endX) < rectMaxX &&
    Math.max(startY, endY) > rectMinY &&
    Math.min(startY, endY) < rectMaxY
  );
};
