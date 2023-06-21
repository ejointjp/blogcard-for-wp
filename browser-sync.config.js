const path = require('path')

const options = {
  ui: {
    port: 3000
  },
  files: [path.resolve(__dirname, 'public', '**', '*')],
  notify: false,
  open: false,
  reloadDebounce: 0,
  reloadThrottle: 0
}

const proxy = 'http://lovemac.lo'
if (proxy) {
  options.proxy = {
    target: proxy
  }
} else {
  options.server = 'public'
}

module.exports = options
