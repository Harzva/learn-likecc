'use strict'

function encode(data) {
  return Buffer.from(JSON.stringify(data))
}

function decode(data) {
  return JSON.parse(data.toString())
}

module.exports = {
  encode,
  decode,
}
