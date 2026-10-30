import { Sculpture, SculptureInput, Order, OrderInput, PresignedUploadResponse, OrderStatus } from '../types';
import { INITIAL_MOCK_SCULPTURES } from './mockData';

const API_BASE = '/api';

// Helper to retrieve auth header
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('nsg_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Local mock storage key
const STORAGE_SCULPTURES_KEY = 'nsg_sculptures_local';
const STORAGE_ORDERS_KEY = 'nsg_orders_local';

function getLocalSculptures(): Sculpture[] {
  const saved = localStorage.getItem(STORAGE_SCULPTURES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore
    }
  }
  return INITIAL_MOCK_SCULPTURES;
}

function saveLocalSculptures(items: Sculpture[]) {
  localStorage.setItem(STORAGE_SCULPTURES_KEY, JSON.stringify(items));
}

function getLocalOrders(): Order[] {
  const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Ignore
    }
  }
  return [];
}

function saveLocalOrders(items: Order[]) {
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(items));
}

// =============================================================================
// PUBLIC GALLERY API
// =============================================================================

export async function fetchSculptures(
  statusFilter?: string,
  materialFilter?: string,
  includeSold: boolean = true
): Promise<Sculpture[]> {
  try {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (materialFilter) params.append('material', materialFilter);
    params.append('include_sold', includeSold ? 'true' : 'false');

    const res = await fetch(`${API_BASE}/sculptures?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API unreachable, serving from local storage:', err);
  }

  // Fallback to local storage
  let items = getLocalSculptures();
  if (statusFilter) {
    items = items.filter((s) => s.status === statusFilter);
  } else if (!includeSold) {
    items = items.filter((s) => s.status !== 'SOLD');
  }
  if (materialFilter) {
    const matClean = materialFilter.toLowerCase();
    items = items.filter(
      (s) =>
        s.material_ua.toLowerCase().includes(matClean) ||
        s.material_en.toLowerCase().includes(matClean)
    );
  }
  return items.sort((a, b) => a.display_order - b.display_order);
}

export async function fetchSculptureBySlug(slug: string): Promise<Sculpture> {
  try {
    const res = await fetch(`${API_BASE}/sculptures/slug/${slug}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API unreachable, searching local storage:', err);
  }

  const items = getLocalSculptures();
  const found = items.find((s) => s.slug === slug);
  if (found) return found;

  throw new Error(`Скульптуру зі слагом '${slug}' не знайдено.`);
}

export async function submitOrder(input: OrderInput): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      return await res.json();
    }

    if (res.status === 409) {
      const err = await res.json();
      throw new Error(err.detail || 'Ця скульптура вже зарезервована або продана.');
    }
    const err = await res.json();
    throw new Error(err.detail || 'Помилка при створенні замовлення.');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('Backend unavailable, recording order locally:', err);
  }

  // Local fallback simulation
  const items = getLocalSculptures();
  const sculpture = items.find((s) => s.id === input.sculpture_id);
  if (!sculpture) {
    throw new Error('Скульптуру не знайдено.');
  }

  if (!input.is_inquiry && sculpture.status !== 'AVAILABLE') {
    throw new Error('Ця скульптура вже зарезервована або продана.');
  }

  const reservationCode = `NSG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const now = new Date().toISOString();

  const mockOrder: Order = {
    id: `ord-${Date.now()}`,
    reservation_code: reservationCode,
    sculpture_id: sculpture.id,
    sculpture_title_ua: sculpture.title_ua,
    sculpture_title_en: sculpture.title_en,
    price_uah: sculpture.price_uah,
    is_inquiry: !!input.is_inquiry,
    buyer_name: input.buyer_name,
    contact_channel: input.contact_channel,
    telegram_handle: input.telegram_handle,
    email: input.email,
    delivery_city_country: input.delivery_city_country,
    delivery_method: input.delivery_method,
    comment: input.comment,
    status: 'PENDING_COORDINATION',
    created_at: now,
    updated_at: now,
  };

  // Atomically flip sculpture status to RESERVED in local store
  if (!input.is_inquiry) {
    sculpture.status = 'RESERVED';
    sculpture.updated_at = now;
    saveLocalSculptures(items);
  }

  const orders = getLocalOrders();
  orders.unshift(mockOrder);
  saveLocalOrders(orders);

  return mockOrder;
}

// =============================================================================
// PROTECTED ARTIST ADMIN API
// =============================================================================

export async function fetchAdminSculptures(): Promise<Sculpture[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/sculptures`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using local admin sculptures:', err);
  }
  return getLocalSculptures();
}

export async function createSculpture(data: SculptureInput): Promise<Sculpture> {
  try {
    const res = await fetch(`${API_BASE}/admin/sculptures`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || 'Помилка додавання скульптури');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;
    console.warn('Backend unavailable, saving locally:', err);
  }

  const items = getLocalSculptures();
  const newSculpture: Sculpture = {
    ...data,
    id: `sculpt-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  items.push(newSculpture);
  saveLocalSculptures(items);
  return newSculpture;
}

export async function updateSculpture(
  id: string,
  data: Partial<SculptureInput>
): Promise<Sculpture> {
  try {
    const res = await fetch(`${API_BASE}/admin/sculptures/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.detail || 'Помилка оновлення скульптури');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) throw err;
  }

  const items = getLocalSculptures();
  const idx = items.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Скульптуру не знайдено');

  items[idx] = {
    ...items[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveLocalSculptures(items);
  return items[idx];
}

export async function deleteSculpture(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/sculptures/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Backend unavailable, deleting locally:', err);
  }

  const items = getLocalSculptures().filter((s) => s.id !== id);
  saveLocalSculptures(items);
  return true;
}

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<PresignedUploadResponse> {
  const res = await fetch(`${API_BASE}/admin/upload-url`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ filename, content_type: contentType }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Помилка отримання дозволу на завантаження (HTTP ${res.status}): ${errText}`);
  }
  return await res.json();
}

export async function uploadImageDirectToS3(
  uploadUrl: string,
  fileBlob: Blob,
  contentType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: fileBlob,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Не вдалося зберегти фото в S3: HTTP ${res.status} ${errBody}`);
  }
}

export async function fetchAdminOrders(statusFilter?: string): Promise<Order[]> {
  try {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    const res = await fetch(`${API_BASE}/admin/orders${params}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, returning local orders:', err);
  }
  let orders = getLocalOrders();
  if (statusFilter) {
    orders = orders.filter((o) => o.status === statusFilter);
  }
  return orders;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNotes?: string
): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, updating order status locally:', err);
  }

  const orders = getLocalOrders();
  const orderIdx = orders.findIndex((o) => o.id === orderId);
  if (orderIdx === -1) throw new Error('Замовлення не знайдено');

  orders[orderIdx].status = status;
  orders[orderIdx].updated_at = new Date().toISOString();
  if (adminNotes !== undefined) orders[orderIdx].admin_notes = adminNotes;
  saveLocalOrders(orders);

  // Sync sculpture status locally
  const sculptures = getLocalSculptures();
  const scIdx = sculptures.findIndex((s) => s.id === orders[orderIdx].sculpture_id);
  if (scIdx !== -1) {
    if (status === 'PAID') {
      sculptures[scIdx].status = 'SOLD';
    } else if (status === 'CANCELLED') {
      sculptures[scIdx].status = 'AVAILABLE';
    }
    saveLocalSculptures(sculptures);
  }

  return orders[orderIdx];
}
