export const API_BASE = "/api";

export interface AuthResponse {
  user: { id: string; email: string; credits: number };
  token: string;
}

export interface User {
  id: string;
  clerkId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  credits: number;
  role?: string;
  profession?: string;
  bio?: string;
  headline?: string;
  expertise?: string[];
  website?: string;
  twitter?: string;
  linkedin?: string;
  onboardedAt?: string;
  createdAt: string;
}

export type CreatorPlatform = "medium" | "substack" | "youtube" | "rss";

export interface CreatorSource {
  id: string;
  userId: string;
  platform: CreatorPlatform;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  status: "pending" | "syncing" | "synced" | "error";
  lastSyncedAt?: string;
  lastError?: string;
  itemCount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorChunk {
  id: string;
  sourceId: string;
  title?: string;
  url?: string;
  publishedAt?: string;
  chunkIndex: number;
  contentPreview: string;
  tokenCount: number;
  enabled: boolean;
  hasEmbedding: boolean;
}

export interface CreatorKBSummary {
  sourceCount: number;
  chunkCount: number;
  byStatus: { pending: number; syncing: number; synced: number; error: number };
}

export interface WebIdentityResult {
  enabled: boolean;
  summary?: string;
  results: Array<{ title?: string; url?: string; snippet?: string; score?: number }>;
  error?: string;
}

export interface Module {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  instructions: string;
  imageUrl?: string;
  provider?: string;
  model?: string;
  conversationStarters?: string[];
  capabilities?: string[];
  apiSchema?: any;
  customFields?: any;
  isPublic: boolean;
  featured: boolean;
  usageCount: number;
  favoriteCount: number;
  documents?: ModuleDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleDocument {
  id: string;
  moduleId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isProcessed: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  moduleId: string;
  messages: ChatMessage[];
  title: string;
  totalTokensUsed: number;
  creditsCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  moduleId: string;
  type: "run" | "favorite" | "comment";
  fromUserId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

let getTokenFn: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    if (getTokenFn) {
      return getTokenFn();
    }
    return null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: any = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = await this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.detail || `API error: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async syncUser(data: { role?: string }): Promise<User> {
    return this.request("/auth/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request("/auth/me");
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getCreators(search?: string): Promise<User[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request(`/creators${q}`);
  }

  async getCreatorProfile(userId: string): Promise<{ user: User; modules: Module[] }> {
    return this.request(`/creators/${userId}`);
  }

  async createModule(module: {
    title: string;
    description: string;
    instructions: string;
    provider?: string;
    model?: string;
    conversationStarters?: string[];
    capabilities?: string[];
    isPublic?: boolean;
    featured?: boolean;
    imageUrl?: string;
    apiSchema?: any;
    customFields?: any;
  }) {
    return this.request("/modules", {
      method: "POST",
      body: JSON.stringify(module),
    });
  }

  async getModule(id: string): Promise<Module & { creator: User }> {
    return this.request(`/modules/${id}`);
  }

  async updateModule(id: string, data: Partial<Module>) {
    return this.request(`/modules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getPublicModules(): Promise<(Module & { creator: User })[]> {
    return this.request("/modules");
  }

  async getFeaturedModules(): Promise<(Module & { creator: User })[]> {
    return this.request("/modules/featured");
  }

  async getMyModules(): Promise<Module[]> {
    return this.request("/my-modules");
  }

  async addFavorite(moduleId: string) {
    return this.request(`/modules/${moduleId}/favorite`, {
      method: "POST",
    });
  }

  async removeFavorite(moduleId: string) {
    return this.request(`/modules/${moduleId}/favorite`, {
      method: "DELETE",
    });
  }

  async getFavorites(): Promise<(Module & { creator: User })[]> {
    return this.request("/favorites");
  }

  async uploadDocument(moduleId: string, file: File): Promise<ModuleDocument> {
    const formData = new FormData();
    formData.append("file", file);

    const token = await this.getAuthToken();
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/modules/${moduleId}/documents`, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  }

  async getModuleDocuments(moduleId: string): Promise<ModuleDocument[]> {
    return this.request(`/modules/${moduleId}/documents`);
  }

  async deleteDocument(moduleId: string, documentId: string) {
    return this.request(`/modules/${moduleId}/documents/${documentId}`, {
      method: "DELETE",
    });
  }

  async createConversation(moduleId: string, title?: string): Promise<Conversation> {
    return this.request("/conversations", {
      method: "POST",
      body: JSON.stringify({ module_id: moduleId, title }),
    });
  }

  async getConversation(id: string): Promise<Conversation> {
    return this.request(`/conversations/${id}`);
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request("/conversations");
  }

  async deleteConversation(id: string) {
    return this.request(`/conversations/${id}`, { method: "DELETE" });
  }

  async sendMessage(conversationId: string, message: string) {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async chatDirect(moduleId: string, message: string, conversationId?: string) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({
        module_id: moduleId,
        message,
        conversation_id: conversationId,
      }),
    });
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request("/notifications");
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "POST",
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  async getCredits() {
    return this.request("/billing/credits");
  }

  async getPackages() {
    return this.request("/billing/packages");
  }

  async createCheckout(packageKey: string) {
    return this.request("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ packageKey }),
    });
  }

  async verifySession(sessionId: string) {
    return this.request("/billing/verify-session", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }

  // ---- Creator knowledge base ----------------------------------------------

  async getCreatorPlatforms(): Promise<{ supported: CreatorPlatform[]; webIdentityEnabled: boolean }> {
    return this.request("/creator/platforms");
  }

  async getCreatorSources(): Promise<CreatorSource[]> {
    return this.request("/creator/sources");
  }

  async addCreatorSource(data: { platform: CreatorPlatform; handle: string; enabled?: boolean }): Promise<CreatorSource> {
    return this.request("/creator/sources", {
      method: "POST",
      body: JSON.stringify({ platform: data.platform, handle: data.handle, enabled: data.enabled ?? true }),
    });
  }

  async updateCreatorSource(id: string, data: { handle?: string; enabled?: boolean }): Promise<CreatorSource> {
    return this.request(`/creator/sources/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCreatorSource(id: string) {
    return this.request(`/creator/sources/${id}`, { method: "DELETE" });
  }

  async syncCreatorSource(id: string) {
    return this.request(`/creator/sources/${id}/sync`, { method: "POST" });
  }

  async getCreatorSourceChunks(
    id: string,
    opts: { limit?: number; offset?: number } = {},
  ): Promise<{ total: number; chunks: CreatorChunk[] }> {
    const qs = new URLSearchParams();
    if (opts.limit) qs.set("limit", String(opts.limit));
    if (opts.offset) qs.set("offset", String(opts.offset));
    const tail = qs.toString() ? `?${qs}` : "";
    return this.request(`/creator/sources/${id}/chunks${tail}`);
  }

  async toggleCreatorChunk(id: string, enabled: boolean): Promise<CreatorChunk> {
    return this.request(`/creator/chunks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    });
  }

  async deleteCreatorChunk(id: string) {
    return this.request(`/creator/chunks/${id}`, { method: "DELETE" });
  }

  async getCreatorKBSummary(): Promise<CreatorKBSummary> {
    return this.request("/creator/kb/summary");
  }

  async discoverCreatorIdentity(data: { name?: string; hints?: string[] } = {}): Promise<WebIdentityResult> {
    return this.request("/creator/discover", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
