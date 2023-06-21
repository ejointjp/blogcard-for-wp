module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order'
  ],

  plugins: [
    'stylelint-declaration-block-no-ignored-properties'
  ],

  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "layer",
          "variants",
          "responsive",
          "screen",
          "define-mixin",
          "mixin"
        ],
      },
    ],

    // カラー表記
    // "color-function-notation": "legacy",
    // セレクターの表記
    "selector-class-pattern": null,
    // WordPressのカスタムプロパティに対応
    "custom-property-pattern": "^([a-z][a-z0-9]*)(--?[a-z0-9]+)*$",

    "max-line-length": null,
    // 重複したセレクタの検出
    'no-duplicate-selectors': true,
    // display値によって無効化されてしまうプロパティの検出
    "plugin/declaration-block-no-ignored-properties": true,
    // セレクタの優先度による順番
    "no-descending-specificity": null
  }
}