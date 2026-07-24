import { nextTestSetup } from 'e2e-utils'
import { retry, waitFor } from 'next-test-utils'

describe('hmr-refetch-coalescing', () => {
  const { next, isTurbopack } = nextTestSetup({
    files: __dirname,
  })

  if (!isTurbopack) {
    it('is a Turbopack-only test', () => {})
    return
  }

  it('refetches a page once per edit regardless of how many routes the edit affects', async () => {
    // Build the other routes that import the shared component. Each built
    // route registers a server-side change subscription for its endpoint.
    for (const route of ['/b', '/c', '/d', '/e', '/f']) {
      const res = await next.fetch(route)
      expect(res.status).toBe(200)
    }

    let hmrRefetches = 0
    const browser = await next.browser('/a', {
      beforePageLoad(page: any) {
        page.on('request', (request: any) => {
          if ('next-hmr-refresh' in request.headers()) {
            hmrRefetches++
          }
        })
      },
    })
    expect(await browser.elementByCss('h1').text()).toBe('a: rev-0')

    await next.patchFile('app/shared/banner.js', (content) =>
      content.replace('rev-0', 'rev-1')
    )

    await retry(async () => {
      expect(await browser.elementByCss('h1').text()).toBe('a: rev-1')
    })
    // Let any trailing (redundant) refetches land before counting.
    await waitFor(2000)

    // One edit must result in exactly one refetch of the page, no matter how
    // many route endpoints the edited file is part of, and no matter how the
    // change events fall into send batches.
    expect(hmrRefetches).toBe(1)
  })
})
