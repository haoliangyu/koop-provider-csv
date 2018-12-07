/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/

const fetch = require('node-fetch');
const splitLines = require('split-lines');

function Model (koop) {}

// Public function to return data from the
// Return: GeoJSON FeatureCollection
Model.prototype.getData = function (req, callback) {
  fetch(process.env.URL)
    .then((res) => res.text())
    .then((content) => {
      const geojson = translate(content)
      callback(null, geojson)
    })
    .catch(err => callback(err))
}

function translate (input) {
  const columnX = process.env.COLUMN_X
  const columnY = process.env.COLUMN_Y
  const delimiter = process.env.DELIMITER || ','
  const rows = splitLines(input.trim())
  const columns =  rows[0].split(delimiter).map(formatString)

  return {
    type: 'FeatureCollection',
    features: rows.slice(1).map((row) => formatFeature(row, columns, { x: columnX, y: columnY }, delimiter))
  }
}

function formatString (value) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, value.length - 1)
  }

  return value
}

function formatFeature (row, columns, coordColumns, delimiter) {
  // Most of what we need to do here is extract the longitude and latitude
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: []
    }
  }

  const values = row.split(delimiter).map(formatString)

  for (let i = 0; i < columns.length; i++) {
    if (columns[i] === coordColumns.x) {
      feature.geometry.coordinates.unshift(parseFloat(values[i]));
    } else if (columns[i] === coordColumns.y) {
      feature.geometry.coordinates.push(parseFloat(values[i]))
    } else {
      feature.properties[columns[i]] = values[i];
    }
  }

  return feature
}

module.exports = Model
