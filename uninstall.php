<?php

if (!defined('ABSPATH') && !defined('WP_UNINSTALL_PLUGIN')) {
	exit();
}

// アンインストール時の処理
function litobc_delete_transients() {
	global $wpdb;

	$prefix = 'wpbc--'; // あなたのtransientのプレフィックス
	$transient_pattern = '_transient_' . $prefix . '%';
	$transient_timeout_pattern = '_transient_timeout_' . $prefix . '%';

	$sql_transient = $wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
		$transient_pattern
	);
	$wpdb->query($sql_transient);

	$sql_timeout = $wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
		$transient_timeout_pattern
	);
	$wpdb->query($sql_timeout);
}

litobc_delete_transients();
