import React, { useState } from 'react';
import { X, CheckCircle, Send, Mail, ArrowRight } from 'lucide-react';
import { Sculpture, Order, ContactChannel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { submitOrder } from '../../services/api';
import { Button } from '../common/Button';

interface AcquisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sculpture: Sculpture;
  isInquiry?: boolean;
  onSuccess?: (order: Order) => void;
}

export const AcquisitionModal: React.FC<AcquisitionModalProps> = ({
  isOpen,
  onClose,
  sculpture,
  isInquiry = false,
  onSuccess,
}) => {
  const { language, t } = useLanguage();

  const [name, setName] = useState('');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('TELEGRAM');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam hidden field

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const sculptureTitle = language === 'UA' ? sculpture.title_ua : sculpture.title_en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic frontend checks
    if (!name.trim()) {
      setError(language === 'UA' ? "Будь ласка, вкажіть ваше ім'я" : "Please enter your name");
      return;
    }
    if (contactChannel === 'TELEGRAM' && !telegramHandle.trim()) {
      setError(
        language === 'UA'
          ? "Вкажіть ваш Telegram username або номер телефону"
          : "Please provide your Telegram handle or phone number"
      );
      return;
    }
    if (contactChannel === 'EMAIL' && (!email.trim() || !email.includes('@'))) {
      setError(
        language === 'UA'
          ? "Вкажіть дійсну адресу електронної пошти"
          : "Please provide a valid email address"
      );
      return;
    }
    if (!delivery.trim()) {
      setError(
        language === 'UA'
          ? "Вкажіть місто доставки та бажану службу"
          : "Please indicate your delivery city and preferred courier"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await submitOrder({
        sculpture_id: sculpture.id,
        is_inquiry: isInquiry,
        buyer_name: name.trim(),
        contact_channel: contactChannel,
        telegram_handle: telegramHandle.trim() || undefined,
        email: email.trim() || undefined,
        delivery_city_country: delivery.trim(),
        delivery_method: delivery.trim(),
        comment: comment.trim() || undefined,
        website_hp: honeypot || undefined,
      });

      setCreatedOrder(order);
      if (onSuccess) {
        onSuccess(order);
      }
    } catch (err: any) {
      setError(err.message || 'Сталася помилка при бронюванні. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedOrder(null);
    setError(null);
    setName('');
    setTelegramHandle('');
    setEmail('');
    setDelivery('');
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-xl bg-gallery-milk gallery-card-border shadow-elevation p-6 sm:p-10 text-gallery-ink">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 text-gallery-muted hover:text-gallery-ink transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------------------------------------------------------ */}
        {/* SUCCESS CONFIRMATION SCREEN */}
        {/* ------------------------------------------------------------------ */}
        {createdOrder ? (
          <div className="space-y-6 text-center py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-badge-greenBg text-badge-green mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium leading-tight">
              {isInquiry ? t.order.inquirySuccessTitle : t.order.successTitle}
            </h3>

            <div className="inline-block bg-gallery-stone/70 border border-gallery-border px-4 py-2 rounded text-xs">
              <span className="text-gallery-muted mr-2">{t.order.reservationIdLabel}</span>
              <span className="font-semibold text-gallery-ink font-mono text-sm">
                {createdOrder.reservation_code}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gallery-muted max-w-md mx-auto">
              {t.order.successMessage}
            </p>

            <div className="pt-6 border-t border-gallery-border/60 text-left">
              <div className="text-xs uppercase tracking-museum text-gallery-muted mb-3 font-semibold text-center">
                {t.order.contactDirectly}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`https://t.me/naive_sculptures?text=${encodeURIComponent(
                    `Вітаю! Я щойно оформив(ла) замовлення ${createdOrder.reservation_code} на скульптуру "${sculptureTitle}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 px-4 rounded bg-gallery-stone hover:bg-[#EAE4DC] border border-gallery-border text-xs font-medium text-gallery-ink transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.order.writeTelegram}</span>
                </a>

                <a
                  href={`mailto:artist@naive-sculptures.art?subject=${encodeURIComponent(
                    `Бронювання ${createdOrder.reservation_code}: ${sculptureTitle}`
                  )}`}
                  className="flex items-center justify-center space-x-2 py-3 px-4 rounded bg-gallery-stone hover:bg-[#EAE4DC] border border-gallery-border text-xs font-medium text-gallery-ink transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-gallery-ink" />
                  <span>{t.order.writeEmail}</span>
                </a>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="primary" fullWidth onClick={handleResetAndClose}>
                {t.order.closeBtn}
              </Button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* RESERVATION FORM SCREEN */
          /* ------------------------------------------------------------------ */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="text-xs uppercase tracking-museum text-gallery-muted mb-1 font-semibold">
                {isInquiry ? 'Запит на створення' : 'Пряме придбання'}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium leading-tight">
                {isInquiry ? t.order.inquiryTitle : t.order.modalTitle}
              </h3>
              <p className="text-xs text-gallery-muted mt-1 leading-relaxed">
                {t.order.modalSubtitle}
              </p>
            </div>

            {/* Artwork summary strip */}
            <div className="p-3 bg-gallery-stone/50 border border-gallery-border/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-serif text-base text-gallery-ink font-medium block">
                  {sculptureTitle}
                </span>
                <span className="text-gallery-muted">
                  {sculpture.dimensions.height_cm} × {sculpture.dimensions.width_cm} cm •{' '}
                  {sculpture.year}
                </span>
              </div>
              <div className="font-semibold text-gallery-ink text-sm tabular-nums">
                {sculpture.price_uah.toLocaleString()} ₴
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Honeypot field (hidden from real users, lures bots) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_hp">Leave empty</label>
              <input
                id="website_hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Buyer Name */}
            <div>
              <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
                {t.order.nameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.order.namePlaceholder}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2.5 text-gallery-ink placeholder-gallery-muted/60 focus:outline-none focus:ring-1 focus:ring-gallery-ink"
              />
            </div>

            {/* Preferred Contact Channel Toggle */}
            <div>
              <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-2">
                {t.order.contactChannelLabel}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gallery-stone/60 border border-gallery-border rounded">
                <button
                  type="button"
                  onClick={() => setContactChannel('TELEGRAM')}
                  className={`py-2 px-3 text-xs font-medium rounded transition-all flex items-center justify-center space-x-2 ${
                    contactChannel === 'TELEGRAM'
                      ? 'bg-gallery-ink text-gallery-milk shadow-sm'
                      : 'text-gallery-muted hover:text-gallery-ink'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.order.telegramOption}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactChannel('EMAIL')}
                  className={`py-2 px-3 text-xs font-medium rounded transition-all flex items-center justify-center space-x-2 ${
                    contactChannel === 'EMAIL'
                      ? 'bg-gallery-ink text-gallery-milk shadow-sm'
                      : 'text-gallery-muted hover:text-gallery-ink'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t.order.emailOption}</span>
                </button>
              </div>
            </div>

            {/* Telegram or Email dynamic inputs */}
            {contactChannel === 'TELEGRAM' ? (
              <div>
                <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
                  {t.order.telegramLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  placeholder={t.order.telegramPlaceholder}
                  className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2.5 text-gallery-ink placeholder-gallery-muted/60 focus:outline-none focus:ring-1 focus:ring-gallery-ink font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
                  {t.order.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.order.emailPlaceholder}
                  className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2.5 text-gallery-ink placeholder-gallery-muted/60 focus:outline-none focus:ring-1 focus:ring-gallery-ink"
                />
              </div>
            )}

            {/* Delivery Details */}
            <div>
              <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
                {t.order.deliveryLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                placeholder={t.order.deliveryPlaceholder}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2.5 text-gallery-ink placeholder-gallery-muted/60 focus:outline-none focus:ring-1 focus:ring-gallery-ink"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-gallery-ink uppercase tracking-wider mb-1.5">
                {t.order.commentLabel}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.order.commentPlaceholder}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3.5 py-2 text-gallery-ink placeholder-gallery-muted/60 focus:outline-none focus:ring-1 focus:ring-gallery-ink resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
              >
                <span className="flex items-center space-x-2">
                  <span>{isInquiry ? t.order.submitInquiry : t.order.submitReserve}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Button>
              <p className="text-[11px] text-gallery-muted text-center mt-2.5">
                {t.order.freeNotice}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
