import { createSearchAPI } from 'fumadocs-core/search/server'
import { docsSource } from '@/lib/docs-source'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PageWithData = { data: any; url: string }

export const { GET } = createSearchAPI('advanced', {
  indexes: docsSource.getPages().map((page: PageWithData) => ({
    title: (page.data.title as string) ?? '',
    description: (page.data.description as string) ?? undefined,
    url: page.url,
    id: page.url,
    structuredData: page.data.structuredData,
  })),
})
