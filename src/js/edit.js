import ReactLoading from 'react-loading'
import he from 'he' // 特殊文字のデコード
import Thumbnail from './components/Thumbnail'
import { getDomainFromUrl, isValidUrl, faviconUrl } from './util'
const { PanelBody, BaseControl, SelectControl, ToggleControl, TextControl, Button } = wp.components
const { PlainText, InspectorControls, useBlockProps, MediaUpload, MediaUploadCheck } = wp.blockEditor
const { useState, useEffect } = wp.element

export default function edit (props) {
  const blockProps = useBlockProps({ className: 'wp-blogcard-editor' })
  const {
    attributes: {
      url,
      target,
      nofollow,
      noopener,
      noreferrer,
      external,
      sponsored,
      ugc,
      thumbnail,
      json,
      title,
      description,
      thumbnailUrl
    }
  } = props

  const { setAttributes } = props
  const [tempUrl, setTempUrl] = useState(url) // URL入力時にapi叩きまくらないようにするため Enterを押すとurlにコピーされる
  const [clearText, setClearText] = useState('') // キャッシュをクリアしたときのメッセージ
  const [state, setState] = useState('hidden') // 状態ごとに表示を変えるため
  const api = wpbcAjaxValues.api

  const fetchData = async () => {
    const params = new URLSearchParams()
    params.append('action', wpbcAjaxValues.action)
    params.append('nonce', wpbcAjaxValues.nonce)
    params.append('url', url)

    try {
      const res = await fetch(api, { method: 'post', body: params })
      const getJson = await res.json()

      // jsonが空だったら（初回は）デフォルト値を設定
      if (!Object.keys(json).length) {
        await setDefault()
      }
      await setAttributes({ json: getJson })
    } catch (e) {
      setState('fetch-error')
      console.error(e)
    }
  }

  const changeState = () => {
    if (!isDataEmpty) {
      setState('data-success')
    }
  }

  const onKeyPress = (e) => {
    // URL入力してEnterを押したら
    if (e.key === 'Enter') {
      e.preventDefault()

      // URLが空なら
      if (tempUrl === '') {
        setState('url-empty')
        return false
      }
      // 渡される前にURLの形式チェック
      if (!isValidUrl(tempUrl)) {
        setState('url-invalid')
        return false
      }

      // 前のURLから変更がなければ何もしない
      if (tempUrl === url) {
        return false
      }

      // 入力URLを実際のURLに渡す（検索がはじまる）
      setAttributes({ url: tempUrl })
      // 検索モード
      setState('search')
    }
  }

  // キャッシュ削除ボタンへfetch
  const removeCache = async () => {
    const params = new URLSearchParams()
    params.append('action', wpbcAjaxValues.actionRemoveCache)
    params.append('nonce', wpbcAjaxValues.nonceRemoveCache)
    params.append('url', url)

    const res = await fetch(api, { method: 'post', body: params })
    const getText = await res.text()
    // cacheクリアが完了したら
    if (getText === '1') setClearText('キャッシュを削除しました')
  }

  const isExternalLink = (url) => {
    // const reg = new RegExp('^(https?:)?//' + document.domain)
    const reg = new RegExp('^(https?:)?//' + location.hostname)

    return !(url.match(reg) || url.charAt(0) === '/')
  }

  // URLが入力されたときの初期設定
  const setDefault = () => {
    if (isExternalLink(url)) {
      setAttributes({
        nofollow: true,
        noreferrer: true,
        external: true
      })
    }
  }

  // データがない
  const isDataEmpty = !Object.keys(json).length
  // 返却されたデータが無効（URLが見つからなかった）
  // const isDataError = json.status === 'error'

  const domain = getDomainFromUrl(url)

  const InfoText = (props) => {
    return <div className="text-sm text-gray-600 mt-2">{props.children}</div>
  }

  const Display = () => {
    switch (state) {
      case 'url-empty':
        return <InfoText>URLを入力してください</InfoText>

      case 'url-invalid':
        return <InfoText>正しいURLの形式で入力してください</InfoText>

      case 'search':
        return <ReactLoading class="mt-2" type="spin" color="rgb(253 210 59)" width="20px" height="20px" />

      case 'data-success':
        return <Result />

      case 'fetch-error':
        return (
          <>
            <InfoText>データを取得できませんでした</InfoText>
          </>
        )

      default:
        return ''
    }
  }

  const ALLOWED_MEDIA_TYPES = ['image']

  const Result = () => {
    const displayTitle = title || json.title
    const displayDescription = description || json.description

    return (
      <div className="wp-blogcard">
        <div className="wp-blogcard-item">
          {!thumbnail && (
            <figure className="wp-blogcard-figure">
              {thumbnailUrl
                ? <img src={thumbnailUrl} alt="" aria-hidden="true" />
                : <Thumbnail url={url} thumbnail={json.thumbnail} />
              }
            </figure>
          )}
          <div className="wp-blogcard-content">
            {displayTitle && <div className="wp-blogcard-title">{he.decode(displayTitle)}</div>}
            {displayDescription && <div className="wp-blogcard-description">{he.decode(displayDescription)}</div>}
            <div className="wp-blogcard-cite">
              {json.hasFavicon === 200 && <img className="wp-blogcard-favicon" src={faviconUrl(url)} alt="" aria-hidden="true" />}
              <div className="wp-blogcard-domain">{domain}</div>
            </div>
          </div>
        </div>
        <div className="wp-blogcard-editor-footer">
          <button className="wp-blogcard-editor-link button button-small"><a href={url} target="blank noopener noreferrer">リンクを表示</a></button>
        </div>
      </div>
    )
  }

  //
  useEffect(() => {
    if (target !== '') setAttributes({ noopener: true })
  }, [target])

  // URLが有効ならfetch
  useEffect(() => {
    if (isValidUrl(url)) {
      fetchData()
    } else {
      setAttributes({ json: {} })
    }
  }, [url])

  // jsonに変更があったらstateを変更する
  useEffect(() => {
    changeState()
  }, [json])

  return (
    <>
      <InspectorControls>
        <PanelBody
          title={'ブロック設定'}
          className="su-components-panel__body su-components-panel__body--wp-blogcard">
          <BaseControl label="target属性">
            <SelectControl
              label=""
              value={target}
              onChange={(value) => setAttributes({ target: value })}
              options={[
                { value: '', label: 'なし' },
                { value: '_blank', label: '_blank (別ウインドウ・タブ)' },
                { value: '_new', label: '_new (ひとつの別ウインドウ・タブ)' },
                { value: '_self', label: '_self (同じウインドウ・タブ)' }
              ]}
          />
          </BaseControl>

          <BaseControl label="rel属性">
            <ToggleControl
              label="external を追加"
              help=""
              checked={external}
              onChange={(value) => setAttributes({ external: value })}
            />
            <ToggleControl
              label="noopener を追加"
              help="target属性があれば強制的に有効になります"
              checked={noopener}
              disabled={target !== ''}
              onChange={(value) => setAttributes({ noopener: target === '' ? value : true })}
            />
            <ToggleControl
              label="nofollow を追加"
              help=""
              checked={nofollow}
              onChange={(value) => setAttributes({ nofollow: value })}
            />
            <ToggleControl
              label="noreferrer を追加"
              help=""
              checked={noreferrer}
              onChange={(value) => setAttributes({ noreferrer: value })}
            />
            <ToggleControl
              label="sponsored を追加"
              help=""
              checked={sponsored}
              onChange={(value) => setAttributes({ sponsored: value })}
            />
            <ToggleControl
              label="ugc を追加"
              help=""
              checked={ugc}
              onChange={(value) => setAttributes({ ugc: value })}
            />
          </BaseControl>
          <BaseControl label="サムネイル">
            <ToggleControl
              label="サムネイルを表示しない"
              help=""
              checked={thumbnail}
              onChange={(value) => { setAttributes({ thumbnail: value }) }}
            />
          </BaseControl>
          <BaseControl label="キャッシュを削除">
            <div className="cached-btn">
              <Button className="button" onClick={removeCache}>キャッシュを削除</Button>
              {json.cached && <span>Cached</span>}
            </div>
            {clearText && <div className="mt-1">{clearText}</div>}
          </BaseControl>
          <BaseControl label="手動で入力">
            <TextControl
              label="タイトルを手動で入力"
              value={title}
              onChange={(value) => { setAttributes({ title: value }) }}
            />
            <TextControl
              label="説明文を手動で入力"
              value={description}
              onChange={(value) => { setAttributes({ description: value }) }}
            />
          </BaseControl>
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(value) => {
                setAttributes({ thumbnailUrl: value.url })
              }}
              allowedTypes={ALLOWED_MEDIA_TYPES}
              value={thumbnailUrl}
              render={({ open }) => (
                <Button
                  onClick={open}
                  className="editor-post-featured-image__toggle"
                >
                  メディアライブラリを開く
                </Button>
              )}
            />
          </MediaUploadCheck>
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <div className="wp-blogcard-editor-url">
          <PlainText
            className="wp-blogcard-editor-input"
            tagName="input"
            placeholder="URLを入力してEnter"
            value={tempUrl}
            onChange={(value) => setTempUrl(value)}
            onKeyPress={onKeyPress}
          />
        </div>

        <Display />

      </div>
    </>
  )
}
