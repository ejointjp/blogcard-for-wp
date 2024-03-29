<?php
/*
Plugin Name: Blogcard by Litography Blocks
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

function litobc_init() {
	register_block_type(__DIR__ . '/build');
}
add_action('init', 'litobc_init');

/**
 * Categories
 *
 * @param array $categories Categories.
 * @param array $post Post.
 */
if (!function_exists('litob_categories')) {
	function litob_categories($categories, $post) {
		return array_merge($categories, [
			[
				'slug' => 'litography-blocks', // ブロックカテゴリーのスラッグ.
				'title' => 'Litography Blocks', // ブロックカテゴリーの表示名.
				// 'icon'  => 'wordpress',    //アイコンの指定（Dashicons名）.
			],
		]);
	}
	add_filter('block_categories_all', 'litob_categories', 10, 2);
}

function litobc_block_enqueue() {
	/**
	 * PHPで生成した値をJavaScriptに渡す
	 *
	 * 第1引数: 渡したいJavaScriptの名前（wp_enqueue_scriptの第1引数に書いたもの）
	 * 第2引数: JavaScript内でのオブジェクト名
	 * 第3引数: 渡したい値の配列
	 */
	wp_localize_script('lito-blogcard-editor-script', 'LITOBC', [
		'api' => admin_url('admin-ajax.php'),
		'action' => 'litobc-action',
		'nonce' => wp_create_nonce('litobc-ajax'),
		'actionRemoveCache' => 'litobc-action-remove-cache', // cache削除用
		'nonceRemoveCache' => wp_create_nonce('litobc-ajax-remove-cache'), // cache削除用
	]);
}
add_action('enqueue_block_editor_assets', 'litobc_block_enqueue');

/**
 * Ajaxで返すもの
 */
function litobc_ajax() {
	if (wp_verify_nonce($_POST['nonce'], 'litobc-ajax')) {
		// キャッシュ機能を有効にするには第2引数をtrue
		$json = litobc_json($_POST, true);
		echo $json;

		die();
	}
}
add_action('wp_ajax_litobc-action', 'litobc_ajax');

function litobc_ajax_remove_cache() {
	if (wp_verify_nonce($_POST['nonce'], 'litobc-ajax-remove-cache')) {
		$transient_name = litobc_transient_name($_POST['url']);
		echo delete_transient($transient_name);

		die();
	}
}
add_action('wp_ajax_litobc-action-remove-cache', 'litobc_ajax_remove_cache');

/**
 * wp-optionsに保存するcacheにつけるoption_name
 * @param string $url
 */
function litobc_transient_name($url) {
	return 'wpbc--' . rawurlencode($url);
}
