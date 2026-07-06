import { createClient, type ClientConfig } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const config: ClientConfig = {
  projectId: "dfzunquy",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: true,
  perspective: "published",
};

export const sanity = createClient(config);

const builder = imageUrlBuilder(sanity);

type ImageSource = Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];
export const urlFor = (src: ImageSource) => builder.image(src);

export const STUDIO_URL = "https://wayline-studio-dfzunquy.sanity.studio";

// ---- Types ----
export type SanityProject = {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  location?: string;
  year?: number;
  disciplines?: string[];
  summary?: string;
  cover?: ImageSource;
  gallery?: ImageSource[];
  body?: unknown[];
  order?: number;
  featured?: boolean;
};

export type SanityPost = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  cover?: ImageSource;
  body?: unknown[];
};

// ---- Queries ----
export const PROJECTS_QUERY = `*[_type == "project"] | order(coalesce(order, 99), year desc) {
  _id, title, slug, client, location, year, disciplines, summary, cover, featured
}`;

export const PROJECT_BY_SLUG_QUERY = `*[_type == "project" && slug.current == $slug][0] {
  _id, title, slug, client, location, year, disciplines, summary, cover, gallery, body
}`;

export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, publishedAt, category, excerpt, cover
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, publishedAt, category, excerpt, cover, body
}`;
