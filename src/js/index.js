import attributes from './attributes'
import edit from './edit'
import save from './save'
const { registerBlockType } = wp.blocks

registerBlockType('su/blogcard', {
  apiVersion: 2,
  title: 'ブログカード',
  description: '',
  category: 'su',
  icon: 'admin-links',
  keywords: [
    'リンク',
    '埋め込み',
    'カード型',
    'カード',
    'card',
    'embed',
    'link'
  ],
  attributes,
  edit,
  save
})
