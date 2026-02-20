import { defineDocs, defineConfig } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    // Remark plugins for enhanced MDX
    remarkPlugins: [],
    // Rehype plugins for enhanced HTML output
    rehypePlugins: [],
  },
})
