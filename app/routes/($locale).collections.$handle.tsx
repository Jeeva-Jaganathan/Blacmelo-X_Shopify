import { redirect, useLoaderData, useSearchParams } from 'react-router';
import { useMemo } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { getPaginationVariables, Analytics } from '@shopify/hydrogen';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import { RepresentCollectionPage } from '~/components/RepresentCollectionPage';
import {
  isPrivateExclusive,
  isClubExclusive,
} from '~/lib/productExclusivity';
// import {CollectionPage} from '~/components/CollectionPage'; // Original style
import collectionStyles from '~/styles/pages/collection.css?url';
import productGridStyles from '~/styles/components/product/product-grid.css?url';
import productCardStyles from '~/styles/components/product/product-card.css?url';
import buttonsStyles from '~/styles/components/buttons.css?url';
import filterPanelStyles from '~/styles/components/filters/filter-panel.css?url';

export const links = () => [
  { rel: 'stylesheet', href: collectionStyles },
  { rel: 'stylesheet', href: productGridStyles },
  { rel: 'stylesheet', href: productCardStyles },
  { rel: 'stylesheet', href: buttonsStyles },
  { rel: 'stylesheet', href: filterPanelStyles },
];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `BLACMELO | ${data?.collection?.title ?? ''}` }];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page~~
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context, params, request }: LoaderFunctionArgs) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 30, // Load 30 products per page ~~
  });

  if (!handle) {
    throw redirect('/collections');
  }

  // DEVELOPMENT: Redirect specific collections if needed
  const devCollectionHandles = ['blacmelo +', 'blacmelo%20+'];
  if (devCollectionHandles.includes(handle.toLowerCase())) {
    const url = new URL(request.url);
    throw redirect(`${url.pathname.replace(/\/collections\/[^/]+/, '/collections/unisex')}${url.search}`);
  }

  // ALIAS: w-tops -> tshirts
  if (handle.toLowerCase() === 'w-tops') {
    const url = new URL(request.url);
    throw redirect(`${url.pathname.replace(/\/collections\/w-tops/i, '/collections/tshirts')}${url.search}`);
  }

  // UNISEX: All products are gender-neutral. /collections/men and /collections/women
  // redirect to all-products, carrying ?gender= as a UI image-display preference only —
  // it never hides products. This prevents inventory duplication and broken ad funnels.
  const genderHandles = ['men', 'man', 'women', 'woman'];
  if (genderHandles.includes(handle.toLowerCase())) {
    const genderHint = handle.toLowerCase().startsWith('m') ? 'men' : 'women';
    throw redirect(`/collections/all?gender=${genderHint}`);
  }

  const queryHandle = handle.toLowerCase() === 'tshirts' ? 'w-tops' : handle;

  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: { handle: queryHandle, ...paginationVariables },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // Prevent redirect loop for aliases
  if (handle.toLowerCase() === 'tshirts' && collection.handle === 'w-tops') {
    collection.handle = 'tshirts';
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: collection });

  // Only filter for exclusivity — gender NEVER hides products (all products are unisex).
  // The ?gender= URL param is a photo-display preference, handled client-side only.
  if (collection) {
    collection.products.nodes = collection.products.nodes.filter(
      (product: any) => !isPrivateExclusive(product) && !isClubExclusive(product)
    );
  }

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const { collection } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();

  // Gender is a photo-display preference only — derived from ?gender= URL param.
  // It never determines which products appear; all products are unisex.
  const genderContext = useMemo(() => {
    const val = params.get('gender')?.toLowerCase();
    return val === 'men' || val === 'women' ? (val as 'men' | 'women') : null;
  }, [params]);

  return (
    <>
      <RepresentCollectionPage collection={collection} genderContext={genderContext} />
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItemCollection on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItemCollection on Product {
    id
    handle
    title
    productType
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    tags
    collections(first: 5) {
      nodes {
        handle
      }
    }
    images(first: 10) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    variants(first: 100) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItemCollection
      }
      maxVariantPrice {
        ...MoneyProductItemCollection
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItemCollection
      }
    }
    metafields(
      identifiers: [
        {namespace: "custom", key: "color_name"}
        {namespace: "custom", key: "color"}
        {namespace: "category", key: "color"}
        {namespace: "category", key: "Color"}
      ]
    ) {
      key
      value
      namespace
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionPage(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItemCollection
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
