<?php

/**
 * リンクのブログカードのコンテンツ部分
 */
function wpbc_json($attr, $transient = true)
{
  // データベースのwp-optionsに登録されるoption_name
  $transient_name = wpbc_transient_name($attr['url']);

  // リンクデータのcacheがある場合、cacheを返却
  if ($transient === true) {
    if (false !== ($cache = get_transient($transient_name))) {
      // cacheが使われてる場合は{cached:true}を返却
      $cache['cached'] = true;
      // 配列で保存されているのでJSONに変換
      return json_encode($cache);
    }
  }

  // サイトのHTMLを全部取得
  // $html = file_get_contents($attr['url']);
  $results = wp_remote_get($attr['url']);
  $html = $results['body'];

  // UTF-8に変換
  $html = wpbc_convert_encoding($html);

  // すべてのOGPを取得
  $og = wpbc_get_ogp($html);

  /////////////////////////////////////////////////////

  // タイトルを取得

  /////////////////////////////////////////////////////

  // titleタグからタイトルを取得
  preg_match('/<title>(.*?)<\/title>/i', $html, $result);
  // titleタグから取得できなければ og:title から

  $title = $result[1] ? $result[1] : $og['title'];

  /////////////////////////////////////////////////////

  // descriptionを取得

  /////////////////////////////////////////////////////

  // metaタグからdescirptionを取得
  $meta_tags = get_meta_tags($attr['url']);

  // descriptionタグから取得できなければ og:description から
  $description = $meta_tags['description'] ? $meta_tags['description'] : $og['description'];

  // UTF-8に変換
  $description = wpbc_convert_encoding($description);
  $description = mb_strlen($description) > 100 ? mb_substr($description, 0, 100) . '...' : $description;

  /////////////////////////////////////////////////////

  // サムネイルを取得

  /////////////////////////////////////////////////////

  // 画像を取得
  // 自サイトの場合は $post_ID を取得
  $post_ID = url_to_postid($attr['url']);

  if ($post_ID !== 0 && has_post_thumbnail($post_ID)) {
    // 自サイトの場合はアイキャッチを表示
    $thumbnail = get_the_post_thumbnail_url($post_ID, 'medium_large');
  } elseif (isset($og['image']) && wpbc_url_exists($og['image'])) {
    // og:image がある場合は表示
    $thumbnail = $og['image'];
  }

  /////////////////////////////////////////////////////

  // Faviconを表示できるかチェック

  /////////////////////////////////////////////////////

  $has_favicon = wpbc_url_exists('https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=' . $attr['url'] . '&size=16');

  /////////////////////////////////////////////////////

  // JSONを返す

  /////////////////////////////////////////////////////

  if (wpbc_url_exists($attr['url']) !== false) {

    // URLが存在する場合
    $return_arr = [
      'title' => $title,
      'description' => $description,
      'hasFavicon' => $has_favicon
    ];

    // サムネイルがあれば返却
    if ($thumbnail) {
      $return_arr['thumbnail'] = $thumbnail;
    }

    // wp-optionにキャッシュを保存
    if ($transient) {
      // 30日保存
      set_transient($transient_name, $return_arr, 60 * 60 * 24 * 30);
    }
  } else {
    $return_arr = [];
  }

  return json_encode($return_arr);
}

/**
 * URLが存在するかチェック
 */
function wpbc_url_exists($url)
{
  $headers = @wpbc_get_headers($url);

  if ($headers) {
    return $headers['last-status'];
  }
}

/**
 * リダイレクト先もケアしてくれるget_header
 *
 * http://exe.tyo.ro/2010/04/phpget_headers.html
 */
function wpbc_get_headers($url)
{
  $headers = get_headers($url);
  if (!$headers) {
    return $headers;
  }
  $res = [];
  $c = -1;
  foreach ($headers as $h) {
    if (strpos($h, 'HTTP/') === 0) {
      $res[++$c]['status-line'] = $h;
      $res[$c]['status-code'] = (int)strstr($h, ' ');
    } else {
      $sep = strpos($h, ': ');
      $res[$c][strtolower(substr($h, 0, $sep))] = substr($h, $sep + 2);
    }
  }
  $res['count'] = $c;
  $res['last-status'] = $res[$c]['status-code'];
  return $res;
}

/**
 * すべてのOGPを取得
 */
function wpbc_get_ogp($html)
{
  preg_match_all('<meta property=\"og:([^\"]+)\" content=\"([^\"]+)\">', $html, $ogp);
  for ($i = 0; $i < count($ogp[1]); $i++) {
    $og[$ogp[1][$i]] = $ogp[2][$i];
  }
  return $og;
}

/**
 * 文字コードをUTF-8に変換
 */

function wpbc_convert_encoding($string)
{
  // 文字コードを調べる
  $source_encode = mb_detect_encoding($string, ['UTF-8', 'SJIS-win', 'eucJP-win']);

  if ($source_encode === 'UTF-8' || !$source_encode) {
    // UTF-8なら何もしない
    return $string;
  } else {
    // UTF-8じゃなければUTF-8にエンコードする
    return mb_convert_encoding($string, 'UTF-8', $source_encode);
  }
}
