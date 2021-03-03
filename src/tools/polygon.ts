export default class Polygon {
  public static getQueryPolygonFromPolygon(polygon: [number, number][]) {
    polygon.push(polygon[0]);
    let polygonFromText = "POLYGONFROMTEXT('POLYGON((";
    for (let i = 0; i <= polygon.length - 1; i++) {
      const point = polygon[i];
      polygonFromText += `${point[0]} ${point[1]}`;
      if (i < polygon.length - 1) polygonFromText += ', ';
    }

    polygonFromText += "))')";
    return polygonFromText;
  }
}
