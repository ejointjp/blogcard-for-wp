<?php
/*
Plugin Name: Blogcard for WP
Plugin URI: https://e-joint.jp/works/blogcard-for-wp
Description: URLを貼るだけで、ブログカード風のリンクが作れるGutenbergブロックです。
Version:     1.0.7
Author:      Takashi Fujisaki
Author URI:  https://e-joint.jp
License:     GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

/*
WP Blogcard is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.

WP Blogcard is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with WP Blogcard. If not, see https://www.gnu.org/licenses/gpl-2.0.html.
*/

include_once plugin_dir_path(__FILE__) . 'inc/return_json.php';

add_action('init', 'wpbc_block_init');
function wpbc_block_init()
{
  // Block JS
  wp_register_script(
    'wp-blogcard-editor',
    plugins_url('dist/index.js', __FILE__),
    [],
    filemtime(plugin_dir_path(__FILE__) . 'dist/index.js'),
    '',
    true
  );
  wp_set_script_translations('wp-blogcard-editor', 'wpbc-blocks');

  // Editor CSS
  wp_register_style(
    'wp-blogcard-editor',
    plugins_url('dist/editor-style.css', __FILE__),
    [],
    filemtime(plugin_dir_path(__FILE__) . 'dist/editor-style.css'),
    'all'
  );

  // Frontend CSS
  wp_register_style(
    'wp-blogcard',
    plugins_url('dist/style.css', __FILE__),
    [],
    filemtime(plugin_dir_path(__FILE__) . 'dist/style.css'),
    'all'
  );

  register_block_type('su/blogcard', [
    'editor_script' => 'wp-blogcard-editor',
    'editor_style'  => 'wp-blogcard-editor',
    'style'         => 'wp-blogcard'
  ]);
}

/**
 * Categories
 *
 * @param array $categories Categories.
 * @param array $post Post.
 */
if (!function_exists('su_categories')) {
  function su_categories($categories, $post)
  {
    return array_merge(
      $categories,
      [
        [
          'slug'  => 'su',   // ブロックカテゴリーのスラッグ.
          'title' => 'su blocks'  // ブロックカテゴリーの表示名.
          // 'icon'  => 'wordpress',    //アイコンの指定（Dashicons名）.
        ]
      ]
    );
  }
  add_filter('block_categories_all', 'su_categories', 10, 2);
}

add_action('enqueue_block_editor_assets', 'wpbc_enqueue_block_editor_assets');
function wpbc_enqueue_block_editor_assets()
{
  /**
   * PHPで生成した値をJavaScriptに渡す
   *
   * 第1引数: 渡したいJavaScriptの名前（wp_enqueue_scriptの第1引数に書いたもの）
   * 第2引数: JavaScript内でのオブジェクト名
   * 第3引数: 渡したい値の配列
   */
  wp_localize_script('wp-blogcard-editor', 'wpbcAjaxValues', [
    'api' => admin_url('admin-ajax.php'),
    'action' => 'wpbc-action',
    'nonce' => wp_create_nonce('wpbc-ajax'),
    'actionRemoveCache' => 'wpbc-action-remove-cache', // cache削除用
    'nonceRemoveCache' => wp_create_nonce('wpbc-ajax-remove-cache') // cache削除用
  ]);
}


/**
 * Ajaxで返すもの
 */
function wpbc_ajax()
{
  if (wp_verify_nonce($_POST['nonce'], 'wpbc-ajax')) {

    // キャッシュ機能を有効にするには第2引数をtrue
    $json = wpbc_json($_POST, true);
    echo $json;

    die();
  }
}
add_action('wp_ajax_wpbc-action', 'wpbc_ajax');

function wpbc_ajax_remove_cache()
{
  if (wp_verify_nonce($_POST['nonce'], 'wpbc-ajax-remove-cache')) {

    $transient_name = wpbc_transient_name($_POST['url']);
    echo (delete_transient($transient_name));

    die();
  }
}
add_action('wp_ajax_wpbc-action-remove-cache', 'wpbc_ajax_remove_cache');

/**
 * wp-optionsに保存するcacheにつけるoption_name
 * @param string $url
 */
function wpbc_transient_name($url)
{
  return 'wpbc--' . rawurlencode($url);
}
