import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Matembo Prompts'
export const SITE_URL = 'https://www.matembotech.site'
const DEFAULT_TITLE = "Matembo Prompts — East Africa's #1 AI Image Prompt Library"
const DEFAULT_DESCRIPTION = 'Discover, copy, and create stunning AI images with professionally crafted prompts for AI creators.'
const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`

function SEO({ title, description, url, image, type = 'website', noindex = false, jsonLd }) {
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
  const resolvedDescription = description || DEFAULT_DESCRIPTION
  const resolvedUrl = url || `${SITE_URL}/`
  const resolvedImage = image || DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      <link rel="canonical" href={resolvedUrl} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
