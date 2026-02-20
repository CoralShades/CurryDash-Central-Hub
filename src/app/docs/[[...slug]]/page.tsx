import { notFound } from 'next/navigation'
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page'
import { getMDXComponents } from '@/components/docs/mdx-components'
import { docsSource } from '@/lib/docs-source'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const page = docsSource.getPage(slug)

  if (!page) {
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description && (
        <DocsDescription>{page.data.description}</DocsDescription>
      )}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return docsSource.generateParams()
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const page = docsSource.getPage(slug)

  if (!page) {
    return {}
  }

  return {
    title: `${page.data.title} — CurryDash Docs`,
    description: page.data.description,
  }
}
