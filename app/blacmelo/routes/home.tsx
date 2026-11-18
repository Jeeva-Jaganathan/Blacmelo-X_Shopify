import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import designStyles from "~/blacmelo/globals.css?url";
import SmoothScroll from "~/blacmelo/components/providers/SmoothScroll";
import StoreProvider from "~/blacmelo/components/providers/Store";
import Nav from "~/blacmelo/components/Nav";
import Hero from "~/blacmelo/components/sections/Hero";
import Drop from "~/blacmelo/components/sections/Drop";
import Hoodies from "~/blacmelo/components/sections/Hoodies";
import Rail from "~/blacmelo/components/sections/Rail";
import Footer from "~/blacmelo/components/sections/Footer";
import Collection from "~/blacmelo/components/collection/Collection";
import SignatureJacket from "~/blacmelo/components/signature/SignatureJacket";
import { hoodies } from "~/blacmelo/data/hoodies";
import { SHOP_PRODUCTS_QUERY, applyShopData, shopQueryString, toShopData } from "~/blacmelo/shopify";

export const links = () => [{ rel: "stylesheet", href: designStyles }];

export const meta: MetaFunction = () => [
  { title: "BLACMELO | Wear your story" },
  {
    name: "description",
    content: "BLACMELO is a Dubai fashion house making heavyweight oversized tees. The missing piece of luxury.",
  },
  { name: "theme-color", content: "#080808" },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context as any;
  const data = await storefront.query(SHOP_PRODUCTS_QUERY, {
    variables: { query: shopQueryString() },
    cache: storefront.CacheShort(),
  });
  return { shop: toShopData(data?.products?.nodes ?? []) };
}

const HOODIE_TILES = ["black", "red", "brown", "green"].map((key) => {
  const h = hoodies.find((x) => x.key === key)!;
  return {
    key,
    id: `hoodie-${key}`,
    label: h.colour.replace(/\b\w/g, (c) => c.toUpperCase()),
    alt: h.alt,
    src: `/hoodies/${key}-640.webp`,
    srcSet: `/hoodies/${key}-640.webp 640w, /hoodies/${key}-1100.webp 1100w`,
  };
});

export default function Home() {
  const { shop } = useLoaderData<typeof loader>();
  applyShopData(shop);

  return (
    <div className="bm-design">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-bone px-4 py-2 text-sm text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <noscript>
        <style>{`[data-loader],[data-logo-light-wrap]{display:none!important}`}</style>
      </noscript>
      <SmoothScroll>
        <StoreProvider shop={shop}>
          <Nav />
          <main id="main">
            <Hero />
            <Drop />
            <Hoodies />
            <Drop id="hoodie-drop" eyebrow="Collection 02" title="Hoodies" tiles={HOODIE_TILES} filter="hoodies" />
            <Rail />
          </main>
          <Footer />
          <Collection />
          <SignatureJacket />
        </StoreProvider>
      </SmoothScroll>
      <div className="grain" aria-hidden />
    </div>
  );
}
