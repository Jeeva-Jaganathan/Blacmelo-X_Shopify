import {flatRoutes} from '@react-router/fs-routes';
import {
  index,
  layout,
  type RouteConfig,
  type RouteConfigEntry,
} from '@react-router/dev/routes';
import {hydrogenRoutes} from '@shopify/hydrogen';

/**
 * Two shells:
 * - the new BLACMELO design (home for now; more pages move over as they are redesigned)
 * - the legacy shell (old header, footer, styles) for every page not yet redesigned
 */
const OLD_HOME = 'routes/($locale)._index.tsx';

function withoutOldHome(entries: RouteConfigEntry[]): RouteConfigEntry[] {
  return entries
    .filter((e) => e.file !== OLD_HOME)
    .map((e) => (e.children ? {...e, children: withoutOldHome(e.children)} : e));
}

const fileRoutes = await flatRoutes();

export default hydrogenRoutes([
  index('blacmelo/routes/home.tsx'),
  layout('layouts/legacy.tsx', withoutOldHome(fileRoutes)),
]) satisfies RouteConfig;
