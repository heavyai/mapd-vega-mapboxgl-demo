import sls from "single-line-string"

const makeVegaSpec = ({
  width,
  height,
  minXBounds,
  minYBounds,
  maxYBounds,
  maxXBounds,
  dateString
}) => ({
  "width": width,
  "height": height,
  "data": [
    {
      "name": "heatmap_querygeoheat",
      "sql": sls`
                SELECT
                reg_hex_horiz_pixel_bin_x(conv_4326_900913_x(longitude),${minXBounds},${maxXBounds},conv_4326_900913_y(latitude),${minYBounds},${maxYBounds},2.995983935742972,3.4594642635779986,0,0,${width},${height}) as x,
                reg_hex_horiz_pixel_bin_y(conv_4326_900913_x(longitude),${minXBounds},${maxXBounds},conv_4326_900913_y(latitude),${minYBounds},${maxYBounds},2.995983935742972,3.4594642635779986,0,0,${width},${height}) as y,
                max(anomflow) as color
                FROM channel_anomflow_prospect
                WHERE ((conv_4326_900913_x(longitude) >= ${minXBounds} AND conv_4326_900913_x(longitude) <= ${maxXBounds}) AND
                       (conv_4326_900913_y(latitude) >= ${minYBounds} AND conv_4326_900913_y(latitude) <= ${maxYBounds})) AND ptime = '${dateString}'
                GROUP BY x, y
                `
    },
    {
      "name": "heatmap_querygeoheat_stats",
      "source": "heatmap_querygeoheat",
      "transform": [
        {
          "type": "aggregate",
          "fields": [
            "color",
            "color",
            "color",
            "color"
          ],
          "ops": [
            "min",
            "max",
            "avg",
            "stddev"
          ],
          "as": [
            "minimum",
            "maximum",
            "mean",
            "deviation"
          ]
        },
        {
          "type": "formula",
          "expr": "max(minimum, mean-2*deviation)",
          "as": "mincolor"
        },
        {
          "type": "formula",
          "expr": "min(maximum, mean+2*deviation)",
          "as": "maxcolor"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "domain": [ minXBounds, maxXBounds ],
      "range": "width"
    },
    {
      "name": "y",
      "type": "linear",
      "domain": [ minYBounds, maxYBounds ],
      "range": "height"
    },
    {
      "name": "heat_colorgeoheat",
      "type": "quantize",
      "domain": {
        "data": "heatmap_querygeoheat_stats",
        "fields": [
          "mincolor",
          "maxcolor"
        ]
      },
      "range": [
        "rgba(178, 144, 111, 0.9)",
        "#c7eae5",
        "#214365"
      ],
      "default": "rgba(13,8,135,0.5)",
      "nullValue": "rgba(13,8,135,0.5)"
    }
  ],
  "marks": [
    {
      "type": "symbol",
      "from": {
        "data": "heatmap_querygeoheat"
      },
      "properties": {
        "shape": "hexagon-horiz",
        "xc": {
          "field": "x"
        },
        "yc": {
          "field": "y"
        },
        "width": 2.995983935742972,
        "height": 3.4594642635779986,
        "fillColor": {
          "scale": "heat_colorgeoheat",
          "field": "color"
        }
      }
    }
  ]
});

export default makeVegaSpec
