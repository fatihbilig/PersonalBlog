export type PostCategory = "TECH" | "ACADEMIC" | "GÜNLÜK";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  category: PostCategory;
  viewCount?: number | null;
  date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  readTimeMinutes?: number | null;
  tags?: string[] | null;
  imageUrl?: string | null;
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  tech?: string[] | null;
  links?: ProjectLink[] | null;
  highlights?: string[] | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminStats = {
  counts: { posts: number; projects: number; totalViews: number };
  topPosts: { id: number; title: string; slug: string; viewCount: number; createdAt: string }[];
  visitorsByCountry: { country: string; count: number }[];
};

function normalizeApiBase(raw?: string): string {
  const fallback = "http://localhost:4000/api";
  const value = raw?.trim();
  if (!value) return fallback;

  const withoutTrailingSlash = value.replace(/\/+$/, "");
  if (/\/api$/i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  return `${withoutTrailingSlash}/api`;
}

export const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE);
const TOKEN_KEY = "auth_token";
const AUTH_EVENT_NAME = "auth-token-change";

/** localStorage'dan kalıcı token'ı yalnızca bir kez temizle */
let legacyLocalTokenCleared = false;

async function safeJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} (${res.url || "unknown url"})`);
  }
  return (await res.json()) as T;
}

async function readApiErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const j = (await res.json()) as unknown;
    if (j && typeof j === "object" && "message" in j) {
      const m = (j as { message: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  try {
    if (!legacyLocalTokenCleared) {
      window.localStorage.removeItem(TOKEN_KEY);
      legacyLocalTokenCleared = true;
    }
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  } catch {
    // ignore storage failures
  }
}

export function clearToken() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  } catch {
    // ignore storage failures
  }
}

export function onAuthTokenChange(callback: () => void) {
  if (!isBrowser()) return () => {};
  const handler = () => callback();
  window.addEventListener(AUTH_EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

async function authedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init?.headers ?? undefined);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!headers.has("Content-Type") && init?.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  return await fetch(input, { ...init, headers, cache: "no-store" });
}

/** Tarayıcı / admin: her zaman taze veri */
export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`, { cache: "no-store" });
  return await safeJson<Post[]>(res);
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, { cache: "no-store" });
  return await safeJson<Project[]>(res);
}

/** Sadece RSC (server): Next önbelleği — site hızı için */
export async function getPostsForRsc(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`, { cache: "no-store" });
  return await safeJson<Post[]>(res);
}

export type PostsPaged = {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** `page` verildiğinde API sayfalı JSON döner; liste + öne çıkan için ayrı çağrılar kullanılır */
export async function getPostsPagedForRsc(params: {
  page: number;
  pageSize?: number;
  category?: PostCategory;
  search?: string;
}): Promise<PostsPaged> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize ?? 9));
  if (params.category) sp.set("category", params.category);
  if (params.search?.trim()) sp.set("search", params.search.trim());
  const res = await fetch(`${API_BASE}/posts?${sp.toString()}`, { cache: "no-store" });
  return await safeJson<PostsPaged>(res);
}

export async function getProjectsForRsc(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, { cache: "no-store" });
  return await safeJson<Project[]>(res);
}

export type ProjectsPaged = {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getProjectsPagedForRsc(params: {
  page: number;
  pageSize?: number;
  search?: string;
}): Promise<ProjectsPaged> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize ?? 9));
  if (params.search?.trim()) sp.set("search", params.search.trim());
  const res = await fetch(`${API_BASE}/projects?${sp.toString()}`, { cache: "no-store" });
  return await safeJson<ProjectsPaged>(res);
}

export async function getPostBySlugForRsc(slug: string): Promise<Post> {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, { cache: "no-store" });
  return await safeJson<Post>(res);
}

export async function login(params: {
  username: string;
  password: string;
}): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await safeJson<unknown>(res);
  const token =
    typeof data === "object" && data && "token" in data
      ? String((data as { token: unknown }).token)
      : "";

  if (!token) throw new Error("Login response did not include token.");
  setToken(token);
  return { token };
}

export async function submitContactForm(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject?.trim() || "Web Sitesi İletişim Formu",
      message: input.message.trim(),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, `Mesaj gönderilemedi (${res.status})`),
    );
  }
}

export type CreatePostInput = {
  title: string;
  excerpt: string;
  category: PostCategory;
  content: string;
  imageUrl?: string | null;
};

export type CreateProjectInput = {
  title: string;
  summary: string;
  tech: string[];
  imageUrl?: string | null;
};

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await authedFetch(`${API_BASE}/posts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, `Yazı eklenemedi (${res.status})`),
    );
  }
  return (await res.json()) as Post;
}

export async function updatePost(id: string, input: Partial<CreatePostInput>): Promise<Post> {
  // Try PATCH first (most REST APIs), fallback to PUT
  let res = await authedFetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (res.status === 405) {
    res = await authedFetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }
  if (!res.ok) {
    let msg = `Güncelleme başarısız (${res.status})`;
    try { const body = await res.json(); msg = body?.message ?? body?.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return await safeJson<Post>(res);
}

export async function deletePost(id: string): Promise<void> {
  const res = await authedFetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const payload = {
    title: input.title,
    summary: input.summary,
    tech: input.tech,
    imageUrl: input.imageUrl ?? null,
  };
  const res = await authedFetch(`${API_BASE}/projects`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return await safeJson<Project>(res);
}

export async function updateProject(id: string, input: Partial<CreateProjectInput>): Promise<Project> {
  let res = await authedFetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (res.status === 405) {
    res = await authedFetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }
  if (!res.ok) {
    let msg = `Güncelleme başarısız (${res.status})`;
    try { const body = await res.json(); msg = body?.message ?? body?.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return await safeJson<Project>(res);
}

export async function deleteProject(id: string): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/projects/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("image", file);

  const res = await authedFetch(`${API_BASE}/upload/image`, {
    method: "POST",
    body: form,
  });

  const data = await safeJson<unknown>(res);
  const url =
    typeof data === "object" && data && "url" in data
      ? String((data as { url: unknown }).url)
      : "";
  if (!url) throw new Error("Upload response did not include url.");
  return { url };
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  return await safeJson<Post>(res);
}

/** Düzenleme için: önce /posts/by-id/:id (kesin ID), sonra slug/legacy */
export async function getPostById(id: string | number): Promise<Post> {
  const s = encodeURIComponent(String(id));
  const byId = await fetch(`${API_BASE}/posts/by-id/${s}`, { cache: "no-store" });
  if (byId.ok) return (await byId.json()) as Post;
  const legacy = await fetch(`${API_BASE}/posts/${s}`, { cache: "no-store" });
  if (legacy.ok) return (await legacy.json()) as Post;
  throw new Error(`Post bulunamadı (id: ${id})`);
}

/** Same for projects */
export async function getProjectById(id: string | number): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(String(id))}`, {
    cache: "no-store",
  });
  if (res.ok) return await safeJson<Project>(res);
  throw new Error(`Proje bulunamadı (id: ${id})`);
}

export async function registerView(slug: string): Promise<void> {
  await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}/view`, {
    method: "POST",
    cache: "no-store",
  });
}

export type CommentReactions = {
  thumb: number;
  bulb: number;
  heart: number;
};

export type ReactionKind = "THUMB" | "BULB" | "HEART";

export type PostComment = {
  id: string;
  name: string;
  isAdmin?: boolean;
  text: string;
  reactions: CommentReactions;
  authorReply: string | null;
  authorRepliedAt: string | null;
  createdAt: string;
};

export async function getComments(slug: string): Promise<PostComment[]> {
  const res = await fetch(
    `${API_BASE}/posts/${encodeURIComponent(slug)}/comments`,
    { cache: "no-store" },
  );
  return await safeJson<PostComment[]>(res);
}

export async function submitComment(
  slug: string,
  body: { name: string; text: string },
): Promise<PostComment> {
  const res = await authedFetch(
    `${API_BASE}/posts/${encodeURIComponent(slug)}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ name: body.name, text: body.text }),
    },
  );
  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, `Yorum gönderilemedi (${res.status})`),
    );
  }
  return (await res.json()) as PostComment;
}

export async function reactToPostComment(
  slug: string,
  commentId: string,
  body: { type: ReactionKind; previousType?: ReactionKind | null },
): Promise<PostComment> {
  const res = await fetch(
    `${API_BASE}/posts/${encodeURIComponent(slug)}/comments/${encodeURIComponent(commentId)}/react`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: body.type,
        ...(body.previousType !== undefined && body.previousType !== null
          ? { previousType: body.previousType }
          : {}),
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, `Reaksiyon kaydedilemedi (${res.status})`),
    );
  }
  return (await res.json()) as PostComment;
}

export type AdminComment = {
  id: string;
  authorName: string;
  body: string;
  reactions: CommentReactions;
  authorReply: string | null;
  authorRepliedAt: string | null;
  createdAt: string;
  postId: string;
  postTitle: string;
  postSlug: string;
};

export async function getAdminComments(): Promise<AdminComment[]> {
  const res = await authedFetch(`${API_BASE}/admin/comments`);
  return await safeJson<AdminComment[]>(res);
}

export async function deleteAdminComment(id: string): Promise<void> {
  const res = await authedFetch(
    `${API_BASE}/admin/comments/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, `Yorum silinemedi (${res.status})`),
    );
  }
}

export async function patchAdminCommentReply(
  id: string,
  authorReply: string,
): Promise<AdminComment> {
  const res = await authedFetch(
    `${API_BASE}/admin/comments/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorReply }),
    },
  );
  if (!res.ok) {
    throw new Error(
      await readApiErrorMessage(res, `Yanıt kaydedilemedi (${res.status})`),
    );
  }
  return (await res.json()) as AdminComment;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await authedFetch(`${API_BASE}/admin/stats`);
  return await safeJson<AdminStats>(res);
}
