/**
 * The collection lives at #collection, so it has its own address: it can be linked to,
 * and the browser's back button closes it.
 */
export const COLLECTION_HASH = "#collection";

export type CollectionFilter = "all" | "tees" | "hoodies" | "pants";
let filter: CollectionFilter = "all";
/** the category the collection should open on */
export const collectionFilter = () => filter;

export function openCollection(f: CollectionFilter = "all") {
  filter = f;
  window.dispatchEvent(new CustomEvent("bm:collection-filter", { detail: f }));
  if (location.hash === COLLECTION_HASH) return;
  history.pushState({ bmCollection: true }, "", COLLECTION_HASH);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function closeCollection() {
  if (history.state?.bmCollection) {
    history.back();
    return;
  }
  history.replaceState(null, "", location.pathname + location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}


/** The signature jacket lives at #signature; it opens from the point that was clicked. */
export const SIGNATURE_HASH = "#signature";
export type Box = { x: number; y: number; w: number; h: number };
let origin: Box | null = null;
/** where the jacket hangs on the page, so the opening can start from it and the closing return to it */
export const signatureOrigin = () => origin;

export function openSignature(from?: Box) {
  origin = from ?? null;
  if (location.hash === SIGNATURE_HASH) return;
  history.pushState({ bmSignature: true }, "", SIGNATURE_HASH);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function closeSignature() {
  if (history.state?.bmSignature) {
    history.back();
    return;
  }
  history.replaceState(null, "", location.pathname + location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
