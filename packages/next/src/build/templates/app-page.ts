import type { LoaderTree } from '../../server/lib/app-dir-module'
import { createAppPageEntrypoint } from './app-page-runtime'

// Keep this route-specific template small. Turbopack gives every route a
// distinct module identity, while app-page-runtime is shared across routes.

/**
 * The tree created in next-app-loader that holds component segments and modules.
 */
declare const tree: LoaderTree

declare const __next_app_require__: (id: string | number) => unknown
declare const __next_app_load_chunk__: (id: string | number) => Promise<unknown>

// INJECT:tree
// INJECT:__next_app_require__
// INJECT:__next_app_load_chunk__

const entrypoint = createAppPageEntrypoint({
  tree,
  page: 'VAR_DEFINITION_PAGE',
  pathname: 'VAR_DEFINITION_PATHNAME',
  require: __next_app_require__,
  loadChunk: __next_app_load_chunk__,
})

export const __next_app__ = entrypoint.__next_app__
export const routeModule = entrypoint.routeModule
export const handler = entrypoint.handler

export * from '../../server/app-render/entry-base' with { 'turbopack-transition': 'next-server-utility' }
