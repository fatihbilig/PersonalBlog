import { cache } from "react";
import {
  getPostBySlugForRsc,
  getPostsForRsc,
  getProjectsForRsc,
} from "@/lib/api";

/** RSC + React cache: tek istekte paylaşılır; fetch ISR ile önbelleklenir */
export const getPostsCached = cache(async () => getPostsForRsc());
export const getProjectsCached = cache(async () => getProjectsForRsc());
export const getPostBySlugCached = cache(async (slug: string) => getPostBySlugForRsc(slug));
