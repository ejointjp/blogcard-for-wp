module.exports = (ctx) => {
  return {
    map: ctx.options.map,
    plugins: {
      'postcss-import': {},
      'postcss-import-ext-glob': {},
      'postcss-hexrgba': {},
      'postcss-color-function': {},
      'postcss-preset-env': {
        stage: 4,
        autoprefixer: {},
        features: {
          'nesting-rules': true,
          'custom-media-queries': true,
          'is-pseudo-class': false,
          'custom-selectors': true,
          'custom-properties': false
          // 'media-query-range': true,
          // 'alpha-hex-colors': true
        }
      },
      'postcss-extend': {},
      'postcss-mixins': {},
      'postcss-combine-duplicated-selectors': {},
      'postcss-sort-media-queries': {},
      ...(ctx.env === 'production' ? { cssnano: {} } : {})
    }
  }
}
