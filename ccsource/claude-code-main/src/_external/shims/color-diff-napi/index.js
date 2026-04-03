'use strict'

function ColorDiff(_oldStr, _newStr) {
  return { oldHighlights: [], newHighlights: [] }
}

function ColorFile(_content, _language) {
  return { lines: [] }
}

function getSyntaxTheme(_themeName) {
  return null
}

module.exports = {
  ColorDiff,
  ColorFile,
  getSyntaxTheme,
}
