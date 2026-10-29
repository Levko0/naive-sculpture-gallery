import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { fetchAdminOrders, updateOrderStatus } from '../../services/api';
import { Send, Mail, CheckCircle2, Truck, XCircle, Clock } from 'lucide-react';

interface OrdersManagerProps {
  onOrdersUpdated?: () => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ onOrdersUpdated }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (onOrdersUpdated) onOrdersUpdated();
    } catch (err: any) {
      alert(`Помилка оновлення статусу: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING_COORDINATION').length;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gallery-muted animate-pulse">
        Завантаження замовлень та бронювань...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center bg-gallery-stone/30 gallery-card-border p-8">
        <Clock className="w-8 h-8 text-gallery-muted mx-auto mb-2" />
        <h3 className="font-serif text-2xl text-gallery-ink">Поки що немає нових замовлень</h3>
        <p className="text-xs text-gallery-muted mt-1">
          Коли покупець оформить бронь, запит з'явиться тут миттєво.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending status counter summary */}
      <div className="flex items-center justify-between p-4 bg-gallery-stone/50 border border-gallery-border rounded">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gallery-ink">
            Очікують координації автора:
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
            {pendingCount}
          </span>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="text-xs text-gallery-muted hover:text-gallery-ink underline"
        >
          Оновити список
        </button>
      </div>

      {/* Orders Table / Cards */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isPending = order.status === 'PENDING_COORDINATION';
          const isPaid = order.status === 'PAID';
          const isShipped = order.status === 'SHIPPED';
          const isCancelled = order.status === 'CANCELLED';

          const telegramUsername = order.telegram_handle?.replace('@', '').trim();
          const telegramLink = telegramUsername ? `https://t.me/${telegramUsername}` : null;
          const mailtoLink = order.email
            ? `mailto:${order.email}?subject=${encodeURIComponent(
                `Галерея Наївного Мистецтва: Замовлення ${order.reservation_code}`
              )}`
            : null;

          return (
            <div
              key={order.id}
              className={`p-6 bg-gallery-milk gallery-card-border transition-all ${
                isPending ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gallery-border/60">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-semibold text-gallery-ink">
                      {order.reservation_code}
                    </span>
                    {order.is_inquiry ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Запит на схожу роботу
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Бронювання оригіналу
                      </span>
                    )}
                    <span className="text-xs text-gallery-muted">
                      {new Date(order.created_at).toLocaleString('uk-UA')}
                    </span>
                  </div>

                  <h4 className="font-serif text-xl sm:text-2xl text-gallery-ink font-medium mt-1">
                    {order.sculpture_title_ua}
                  </h4>
                  <div className="text-xs text-gallery-muted">
                    Сума: <strong className="text-gallery-ink font-medium">{order.price_uah.toLocaleString()} ₴</strong>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isPending && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      Очікує узгодження оплати
                    </span>
                  )}
                  {isPaid && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Картку оплачено • Продано
                    </span>
                  )}
                  {isShipped && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-300">
                      Відправлено
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Бронь скасовано
                    </span>
                  )}
                </div>
              </div>

              {/* Middle row: Buyer Info & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
                <div>
                  <span className="text-gallery-muted uppercase tracking-wider block font-semibold mb-1">
                    Покупець:
                  </span>
                  <div className="text-sm font-medium text-gallery-ink">{order.buyer_name}</div>
                  <div className="text-gallery-muted mt-1">
                    Канал: <strong>{order.contact_channel}</strong>
                  </div>
                  {order.telegram_handle && (
                    <div className="text-gallery-muted">
                      Telegram: <span className="font-mono">{order.telegram_handle}</span>
                    </div>
                  )}
                  {order.email && <div>Email: {order.email}</div>}
                </div>

                <div>
                  <span className="text-gallery-muted uppercase tracking-wider block font-semibold mb-1">
                    Доставка:
                  </span>
                  <div className="text-gallery-ink font-medium">{order.delivery_city_country}</div>
                  {order.comment && (
                    <div className="mt-2 p-2 bg-gallery-stone/50 rounded text-gallery-muted italic">
                      "{order.comment}"
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom row: 1-Click Contacts & Order Workflow actions */}
              <div className="pt-4 border-t border-gallery-border/60 flex flex-wrap items-center justify-between gap-3">
                {/* 1-Click Contact Buttons */}
                <div className="flex items-center space-x-2">
                  {telegramLink && (
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors border border-blue-200"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Відкрити Telegram</span>
                    </a>
                  )}

                  {mailtoLink && (
                    <a
                      href={mailtoLink}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-gallery-ink text-xs font-medium transition-colors border border-gallery-border"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Написати Email</span>
                    </a>
                  )}
                </div>

                {/* Workflow Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Mark as Paid */}
                  {!isPaid && !isShipped && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'PAID')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      title="Позначає замовлення оплаченим і переводить скульптуру в статус SOLD"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Картку оплачено</span>
                    </button>
                  )}

                  {/* Mark as Shipped */}
                  {isPaid && !isShipped && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-gallery-ink hover:bg-neutral-800 text-gallery-milk text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Відправлено</span>
                    </button>
                  )}

                  {/* Cancel Reservation */}
                  {!isCancelled && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => {
                        if (confirm('Скасувати цю бронь? Скульптура знову стане доступною для купівлі.')) {
                          handleStatusChange(order.id, 'CANCELLED');
                        }
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Скасувати бронь</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
