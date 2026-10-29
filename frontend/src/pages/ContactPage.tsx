import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Send, Mail, MapPin, PackageCheck, Shield } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-3xl mb-16 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
          Прямий зв'язок
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-gallery-ink font-medium leading-tight">
          {t.contact.title}
        </h1>
        <p className="text-base text-gallery-muted font-light leading-relaxed">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Contact Methods */}
        <div className="space-y-8">
          <div className="p-6 bg-gallery-stone/40 gallery-card-border space-y-6">
            {/* Telegram */}
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-gallery-milk border border-gallery-border text-blue-600">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gallery-muted">
                  {t.contact.telegramLabel}
                </div>
                <a
                  href="https://t.me/naive_sculptures"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-xl text-gallery-ink hover:underline block mt-1"
                >
                  @naive_sculptures
                </a>
                <p className="text-xs text-gallery-muted mt-1">
                  Найшвидший спосіб узгодження деталей та надсилання відео скульптури
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4 pt-4 border-t border-gallery-border/50">
              <div className="p-3 rounded-full bg-gallery-milk border border-gallery-border text-gallery-ink">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gallery-muted">
                  {t.contact.emailLabel}
                </div>
                <a
                  href="mailto:artist@naive-sculptures.art"
                  className="font-serif text-xl text-gallery-ink hover:underline block mt-1"
                >
                  artist@naive-sculptures.art
                </a>
                <p className="text-xs text-gallery-muted mt-1">
                  Для офіційних запитів, співпраці з галереями та кураторами
                </p>
              </div>
            </div>

            {/* Studio Address */}
            <div className="flex items-start space-x-4 pt-4 border-t border-gallery-border/50">
              <div className="p-3 rounded-full bg-gallery-milk border border-gallery-border text-gallery-ink">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gallery-muted">
                  Майстерня у Києві
                </div>
                <div className="text-sm font-medium text-gallery-ink mt-1">
                  {t.contact.studioAddress}
                </div>
                <p className="text-xs text-gallery-muted mt-1">
                  Індивідуальні візити за попередньою домовленістю
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Packaging and delivery guarantees */}
        <div className="space-y-6">
          <div className="p-6 bg-gallery-stone/30 gallery-card-border space-y-4">
            <div className="flex items-center space-x-3 text-gallery-ink">
              <PackageCheck className="w-5 h-5" />
              <h3 className="font-serif text-2xl font-medium">
                {t.contact.deliveryInfoTitle}
              </h3>
            </div>
            <p className="text-sm text-gallery-muted leading-relaxed font-light">
              {t.contact.deliveryInfoText}
            </p>
          </div>

          <div className="p-6 bg-gallery-stone/30 gallery-card-border space-y-4">
            <div className="flex items-center space-x-3 text-gallery-ink">
              <Shield className="w-5 h-5" />
              <h3 className="font-serif text-2xl font-medium">
                Пряма оплата та безпека
              </h3>
            </div>
            <p className="text-sm text-gallery-muted leading-relaxed font-light">
              Оплата здійснюється безпосередньо на офіційну картку / рахунок ФОП автора після фото/відеофіксації стану скульптури перед пакуванням. Ви отримуєте фіскальний чек та сертифікат автентичності.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
