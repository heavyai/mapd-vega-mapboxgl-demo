import sls from "single-line-string"

const makeVegaSpec = ({
  width,
  height,
  minXBounds,
  minYBounds,
  maxYBounds,
  maxXBounds,
  filter
}) => ({
  width,
  height,
  data: [
    {
      name: "fec_contributions_oct",
      sql: sls`SELECT
        conv_4326_900913_x(lon) as x,
        conv_4326_900913_y(lat) as y,
        recipient_party as dim0,
        amount as val,
        rowid
        FROM fec_contributions_oct
        WHERE conv_4326_900913_x(lon) between ${minXBounds} and ${maxXBounds}
        AND conv_4326_900913_y(lat) between ${minYBounds} and ${maxYBounds}
        ${filter}
        LIMIT 2000000`
    }
  ],
  scales: [
    {
      name: "x",
      type: "linear",
      domain: [minXBounds, maxXBounds],
      range: "width"
    },
    {
      name: "y",
      type: "linear",
      domain: [minYBounds, maxYBounds],
      range: "height"
    }
  ],
  marks: [
    {
      type: "symbol",
      from: { data: "fec_contributions_oct" },
      properties: {
        width: 10,
        height: 10,
        x: { scale: "x", field: "x" },
        y: { scale: "y", field: "y" },
        fillColor: "blue",
        strokeColor: "rgb(0, 0, 0)",
        strokeWidth: 0.5,
        shape: "circle"
      }
    }
  ]
});

export default makeVegaSpec
