import resetStyles from '~/styles/reset.css?url';
import fontsStyles from '~/styles/core/fonts.css?url';
import themeStyles from '~/styles/core/theme.css?url';
import tailwindCss from '~/styles/core/tailwind.css?url';
import globalsStyles from '~/styles/core/globals.css?url';
import animationsStyles from '~/styles/utilities/animations.css?url';
import responsiveStyles from '~/styles/utilities/responsive.css?url';
import typographyStyles from '~/styles/utilities/typography.css?url';
import customSpacingStyles from '~/styles/utilities/custom-spacing.css?url';
import headerStyles from '~/styles/layout/header.css?url';
import footerStyles from '~/styles/layout/footer.css?url';
import overlayStyles from '~/styles/layout/overlay.css?url';
import announcementBarStyles from '~/styles/layout/announcement-bar.css?url';
import scrollbarStyles from '~/styles/components/scrollbar.css?url';
import hoverMenuStyles from '~/styles/components/menus/hover-menu.css?url';
import mobileMenuStyles from '~/styles/components/menus/mobile-menu.css?url';
import cartStyles from '~/styles/components/cart/cart.css?url';
import recentlyViewedStyles from '~/styles/components/recently-viewed.css?url';
import currencySwitcherStyles from '~/styles/components/currency-switcher.css?url';
import { PageLayout } from '~/components/PageLayout';
import { LenisProvider } from '~/components/smooth-scroll/LenisProvider';
import { CurrencySwitcher } from '~/components/CurrencySwitcher';
import { CurrencyProvider } from '~/context/CurrencyContext';
import { RegionSelectorModal } from '~/components/RegionSelectorModal';
import {Outlet, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

/** The previous site's shell: every page that hasn't moved to the new design yet renders inside it. */
export function links() {
  return [
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: fontsStyles},
    {rel: 'stylesheet', href: themeStyles},
    {rel: 'stylesheet', href: tailwindCss},
    {rel: 'stylesheet', href: globalsStyles},
    {rel: 'stylesheet', href: animationsStyles},
    {rel: 'stylesheet', href: responsiveStyles},
    {rel: 'stylesheet', href: typographyStyles},
    {rel: 'stylesheet', href: customSpacingStyles},
    {rel: 'stylesheet', href: headerStyles},
    {rel: 'stylesheet', href: footerStyles},
    {rel: 'stylesheet', href: overlayStyles},
    {rel: 'stylesheet', href: announcementBarStyles},
    {rel: 'stylesheet', href: scrollbarStyles},
    {rel: 'stylesheet', href: hoverMenuStyles},
    {rel: 'stylesheet', href: mobileMenuStyles},
    {rel: 'stylesheet', href: cartStyles},
    {rel: 'stylesheet', href: recentlyViewedStyles},
    {rel: 'stylesheet', href: currencySwitcherStyles},
  ];
}

export default function LegacyLayout() {
  const data = useRouteLoaderData<RootLoader>('root');
  if (!data) return <Outlet />;
  return (
    <CurrencyProvider>
      <LenisProvider>
        <PageLayout
          header={data.header}
          cart={data.cart}
          isLoggedIn={data.isLoggedIn}
          footer={data.footer}
          publicStoreDomain={data.publicStoreDomain}
          menMenuConfig={data.menMenuConfig}
          womenMenuConfig={data.womenMenuConfig}
          announcements={data.announcements}
          newProducts={data.newProducts}
        >
          <Outlet />
        </PageLayout>
        <CurrencySwitcher />
        <RegionSelectorModal />
      </LenisProvider>
    </CurrencyProvider>
  );
}
