/**
 * Single source of truth for route paths. AppRouter, nav links, and
 * any redirects should all reference these instead of writing the
 * path as a string — a renamed route then only needs to change here.
 */
export const ROUTES = {
  home: "/",
  collection: "/collection",
} as const;
