"""
SNS and SES/SMTP notification publisher for artist alerts and buyer confirmations.
Zero-config email dispatch within the AWS Free Tier.
"""
import html
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any
import boto3
from app.config import settings

logger = logging.getLogger(__name__)


def get_sns_client():
    """Initializes standard SNS client."""
    return boto3.client("sns", region_name=settings.AWS_REGION)


def get_ses_client():
    """Initializes standard SES client."""
    return boto3.client("ses", region_name=settings.SES_REGION or settings.AWS_REGION)


def format_order_notification_email(order: Dict[str, Any]) -> str:
    """Formats an elegant, detailed plain-text notification for the artist."""
    reservation_code = order.get("reservation_code", "UNKNOWN")
    buyer_name = order.get("buyer_name", "Anonymous")
    sculpture_title_ua = order.get("sculpture_title_ua", "Скульптура")
    sculpture_title_en = order.get("sculpture_title_en", "Sculpture")
    price_uah = order.get("price_uah", 0)
    is_inquiry = order.get("is_inquiry", False)
    contact_channel = order.get("contact_channel", "TELEGRAM")
    telegram_handle = order.get("telegram_handle", "")
    email = order.get("email", "")
    locale = order.get("locale", "ua")
    delivery_city = order.get("delivery_city_country", "Не вказано")
    delivery_method = order.get("delivery_method", "Нова Пошта")
    comment = order.get("comment", "") or "Без додаткових коментарів."
    created_at = order.get("created_at", "")

    action_type = "ЗАПИТ ПРО СХОЖУ РОБОТУ" if is_inquiry else "НОВА БРОНЬ / ЗАМОВЛЕННЯ"

    # Direct contact link
    telegram_clean = telegram_handle.replace("@", "").strip() if telegram_handle else ""
    telegram_link = f"https://t.me/{telegram_clean}" if telegram_clean else "Не вказано"
    mailto_link = (
        f"mailto:{email}?subject=Галерея Наївного Мистецтва: Замовлення {reservation_code}"
        if email else "Не вказано"
    )

    body = f"""====================================================
ГАЛЕРЕЯ НАЇВНОГО МИСТЕЦТВА — {action_type}
====================================================

Код бронювання: {reservation_code}
Мова замовлення: {locale.upper()}
Час надходження: {created_at}

1. СКУЛЬПТУРА:
----------------------------------------------------
- Назва: {sculpture_title_ua} ({sculpture_title_en})
- Сума: {price_uah:n} ₴
- Тип запиту: {"Запит на повтор/схожу роботу" if is_inquiry else "Пряме бронювання оригіналу"}

2. КОНТАКТИ ПОКУПЦЯ:
----------------------------------------------------
- Ім'я: {buyer_name}
- Пріоритетний канал зв'язку: {contact_channel}
- Електронна пошта (обов'язково): {email}
  -> Написати лист: {mailto_link}
- Telegram: {telegram_handle or "Не вказано"}
  -> Швидкий перехід у чат: {telegram_link}

3. ДОСТАВКА:
----------------------------------------------------
- Населений пункт / Країна: {delivery_city}
- Бажаний спосіб доставки: {delivery_method}

4. КОМЕНТАР ПОКУПЦЯ:
----------------------------------------------------
"{comment}"

----------------------------------------------------
НАСТУПНІ КРОКИ ДЛЯ ХУДОЖНИКА:
1. Зв'яжіться з покупцем через обраний ним канал ({contact_channel}).
2. Підтвердіть деталі пакування/доставки та надішліть реквізити для оплати на картку.
3. Після зарахування коштів увійдіть в панель керування (/admin) та змініть статус на "Картку оплачено" (PAID).

—
Система сповіщень Naive Art Sculpture Gallery (AWS Serverless)
"""
    return body


def format_artist_order_notification_html(order: Dict[str, Any]) -> str:
    """Formats an elegant, detailed HTML alert for the artist's inbox."""
    reservation_code = html.escape(str(order.get("reservation_code", "UNKNOWN")))
    buyer_name = html.escape(str(order.get("buyer_name", "Anonymous")))
    sculpture_title_ua = html.escape(str(order.get("sculpture_title_ua", "Скульптура")))
    sculpture_title_en = html.escape(str(order.get("sculpture_title_en", "Sculpture")))
    price_uah = order.get("price_uah", 0)
    is_inquiry = order.get("is_inquiry", False)
    contact_channel = html.escape(str(order.get("contact_channel", "TELEGRAM")))
    raw_telegram = str(order.get("telegram_handle", "") or "")
    telegram_handle = html.escape(raw_telegram)
    raw_email = str(order.get("email", "") or "")
    email = html.escape(raw_email)
    locale = html.escape(str(order.get("locale", "ua") or "ua"))
    delivery_city = html.escape(str(order.get("delivery_city_country", "Не вказано")))
    delivery_method = html.escape(str(order.get("delivery_method", "Нова Пошта")))
    comment = html.escape(str(order.get("comment", "") or "Без додаткових коментарів."))
    created_at = html.escape(str(order.get("created_at", "")))

    action_type = "ЗАПИТ ПРО СХОЖУ РОБОТУ" if is_inquiry else "НОВА БРОНЬ СКУЛЬПТУРИ"
    badge_bg = "#B47820" if is_inquiry else "#2E5A36"

    telegram_clean = raw_telegram.replace("@", "").strip()
    telegram_link = html.escape(f"https://t.me/{telegram_clean}") if telegram_clean else ""
    mailto_link = (
        html.escape(f"mailto:{raw_email}?subject=Галерея Наївного Мистецтва: Замовлення {reservation_code}")
        if raw_email else ""
    )

    telegram_button = (
        f'<a href="{telegram_link}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 12px; font-weight: 500; text-decoration: none; padding: 9px 16px; border-radius: 4px; margin-right: 8px;">Відкрити чат у Telegram</a>'
        if telegram_link else ""
    )
    email_button = (
        f'<a href="{mailto_link}" style="display: inline-block; background-color: #18181B; color: #FFFFFF; font-size: 12px; font-weight: 500; text-decoration: none; padding: 9px 16px; border-radius: 4px;">Написати лист покупцю</a>'
        if mailto_link else ""
    )

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{action_type}: {sculpture_title_ua}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181B; line-height: 1.6;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E4DFD7; padding: 36px 30px; border-radius: 4px;">
    
    <div style="border-bottom: 1px solid #E4DFD7; padding-bottom: 16px; margin-bottom: 24px;">
      <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #71717A; display: block; margin-bottom: 4px;">Галерея Наївного Мистецтва</span>
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: 500; color: #18181B;">Сповіщення для автора: {action_type}</h1>
    </div>

    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: {badge_bg}; color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 2px; text-transform: uppercase; letter-spacing: 1px;">
        {action_type}
      </span>
      <span style="display: inline-block; background-color: #F3EFEA; border: 1px solid #E4DFD7; font-family: monospace; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 2px; margin-left: 8px;">
        {reservation_code}
      </span>
      <span style="font-size: 12px; color: #71717A; margin-left: 8px;">
        Мова сайту: {locale.upper()}
      </span>
    </div>

    <div style="background-color: #FAF8F5; border: 1px solid #E4DFD7; padding: 18px; margin-bottom: 20px; border-radius: 4px;">
      <h2 style="font-family: Georgia, serif; font-size: 18px; margin: 0 0 8px 0; color: #18181B;">
        {sculpture_title_ua} <span style="font-size: 14px; font-weight: normal; color: #71717A;">({sculpture_title_en})</span>
      </h2>
      <div style="font-size: 15px; font-weight: 600; color: #18181B;">
        Сума: {price_uah:n} ₴
      </div>
    </div>

    <div style="border: 1px solid #E4DFD7; padding: 18px; margin-bottom: 20px; border-radius: 4px;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #71717A; margin: 0 0 12px 0;">
        Дані покупця:
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 5px 0; color: #71717A; width: 35%;">Ім'я:</td>
          <td style="padding: 5px 0; font-weight: 600; color: #18181B;">{buyer_name}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #71717A;">Електронна пошта:</td>
          <td style="padding: 5px 0; color: #18181B;">
            <a href="{mailto_link}" style="color: #2E5A36; font-weight: 600; text-decoration: underline;">{email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #71717A;">Telegram:</td>
          <td style="padding: 5px 0; color: #18181B;">
            {f'<a href="{telegram_link}" style="color: #2563EB; font-weight: 600; text-decoration: underline;">{telegram_handle}</a>' if telegram_link else (telegram_handle or "Не вказано")}
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #71717A;">Канал координації:</td>
          <td style="padding: 5px 0; font-weight: 500; color: #18181B;">{contact_channel}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #71717A;">Доставка:</td>
          <td style="padding: 5px 0; color: #18181B;">{delivery_city} ({delivery_method})</td>
        </tr>
      </table>

      {f'''<div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #E4DFD7; font-size: 13px;">
        <span style="color: #71717A;">Коментар покупця:</span>
        <blockquote style="margin: 6px 0 0 0; padding: 6px 12px; background-color: #FAF8F5; border-left: 2px solid #71717A; font-style: italic; color: #3F3F46;">
          "{comment}"
        </blockquote>
      </div>''' if comment else ''}
    </div>

    <div style="margin: 24px 0 16px 0;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #71717A; margin: 0 0 10px 0;">Швидка відповідь:</h3>
      <div>
        {telegram_button}
        {email_button}
      </div>
    </div>

    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #E4DFD7; font-size: 11px; color: #71717A;">
      Час створення замовлення: {created_at} &bull; Naive Art Sculpture Gallery
    </div>

  </div>
</body>
</html>"""


def format_buyer_confirmation_email(order: Dict[str, Any]) -> Dict[str, str]:
    """
    Formats localized (UA or EN) confirmation email for the buyer.
    Returns dict with keys: 'subject', 'text', 'html'.
    """
    locale = (order.get("locale") or "ua").lower()
    is_en = locale in ("en", "eng", "english")
    
    reservation_code = order.get("reservation_code", "NSG-ORDER")
    buyer_name = order.get("buyer_name", "")
    sculpture_title = order.get("sculpture_title_en" if is_en else "sculpture_title_ua", "Sculpture")
    price_uah = order.get("price_uah", 0)
    contact_channel = order.get("contact_channel", "TELEGRAM")
    telegram_handle = order.get("telegram_handle", "")
    email = order.get("email", "")
    delivery_city = order.get("delivery_city_country", "")
    delivery_method = order.get("delivery_method", "")
    is_inquiry = order.get("is_inquiry", False)

    channel_desc = f"Telegram ({telegram_handle})" if contact_channel == "TELEGRAM" and telegram_handle else f"Email ({email})"
    h_buyer_name = html.escape(str(buyer_name))
    h_sculpture_title = html.escape(str(sculpture_title))
    h_reservation_code = html.escape(str(reservation_code))
    h_delivery_city = html.escape(str(delivery_city))
    h_delivery_method = html.escape(str(delivery_method))
    h_channel_desc = html.escape(str(channel_desc))

    if is_en:
        subject = f"[Rustam Zhuraiev Gallery] Reservation Confirmed: {sculpture_title} ({reservation_code})"
        if is_inquiry:
            subject = f"[Rustam Zhuraiev Gallery] Inquiry Received: {sculpture_title} ({reservation_code})"

        action_heading = "Inquiry Received" if is_inquiry else "Artwork Reserved"
        status_text = (
            f"Your inquiry regarding a custom piece based on «{sculpture_title}» has been received."
            if is_inquiry
            else f"The original sculpture «{sculpture_title}» has been successfully reserved for you."
        )

        plain_text = f"""NAIVE ART SCULPTURE GALLERY — RUSTAM ZHURAIEV
============================================================
{action_heading}: {reservation_code}

Dear {buyer_name},

Thank you for your appreciation of handcrafted stone sculpture in the Ukrainian Naive Art tradition.
{status_text}

RESERVATION DETAILS:
------------------------------------------------------------
- Sculpture: {sculpture_title}
- Price: {price_uah:n} UAH
- Reservation Code: {reservation_code}
- Preferred Contact: {channel_desc}
- Delivery Destination: {delivery_city} ({delivery_method})

WHAT HAPPENS NEXT:
------------------------------------------------------------
The sculptor, Rustam Zhuraiev, will personally contact you shortly via {channel_desc} to coordinate custom shockproof crating, courier logistics, and direct card/transfer payment details. Zero payment is processed automatically on the website.

ARTIST DIRECT CONTACTS:
- Telegram: https://t.me/zhsculptures (@zhsculptures)
- Email: {settings.SES_SENDER_EMAIL}

Warm regards,
Rustam Zhuraiev Stone Sculpture Gallery
"""

        h_status_text = (
            f"Your inquiry regarding a custom piece based on «{h_sculpture_title}» has been received."
            if is_inquiry
            else f"The original sculpture «{h_sculpture_title}» has been successfully reserved for you."
        )
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{html.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181B; line-height: 1.6;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E4DFD7; padding: 40px 32px; border-radius: 4px;">
    
    <div style="border-bottom: 1px solid #E4DFD7; padding-bottom: 20px; margin-bottom: 30px;">
      <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #71717A; display: block; margin-bottom: 6px;">Naive Art Sculpture Gallery</span>
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: 500; color: #18181B;">Rustam Zhuraiev</h1>
    </div>

    <div style="display: inline-block; background-color: #F3EFEA; border: 1px solid #E4DFD7; padding: 4px 12px; font-size: 12px; font-weight: 600; font-family: monospace; color: #18181B; margin-bottom: 20px; border-radius: 2px;">
      Code: {h_reservation_code}
    </div>

    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 500; margin-top: 0; margin-bottom: 12px; color: #2E5A36;">
      {action_heading}
    </h2>

    <p style="font-size: 14px; color: #3F3F46; margin-bottom: 20px;">
      Dear <strong>{h_buyer_name}</strong>,<br>
      Thank you for your appreciation of handcrafted stone sculpture in the Ukrainian Naive Art tradition. {h_status_text}
    </p>

    <div style="background-color: #FAF8F5; border: 1px solid #E4DFD7; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #71717A; width: 40%;">Artwork:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #18181B;">{h_sculpture_title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717A;">Price:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #18181B;">{price_uah:n} UAH</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717A;">Delivery:</td>
          <td style="padding: 6px 0; color: #18181B;">{h_delivery_city} ({h_delivery_method})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717A;">Coordination:</td>
          <td style="padding: 6px 0; color: #18181B;">{h_channel_desc}</td>
        </tr>
      </table>
    </div>

    <div style="border-left: 2px solid #2E5A36; padding-left: 16px; margin: 24px 0;">
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #71717A; margin: 0 0 6px 0;">What happens next:</h3>
      <p style="font-size: 13px; color: #52525B; margin: 0;">
        The sculptor will personally reach out to you via <strong>{h_channel_desc}</strong> to arrange secure shockproof crating, courier shipping, and direct payment details.
      </p>
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E4DFD7; font-size: 12px; color: #71717A;">
      <p style="margin: 4px 0;"><strong>Need immediate assistance?</strong></p>
      <p style="margin: 4px 0;">Telegram: <a href="https://t.me/zhsculptures" style="color: #18181B; font-weight: 500;">@zhsculptures</a> &bull; Email: <a href="mailto:{settings.SES_SENDER_EMAIL}" style="color: #18181B; font-weight: 500;">{settings.SES_SENDER_EMAIL}</a></p>
    </div>

  </div>
</body>
</html>"""
    else:
        # Ukrainian (default)
        subject = f"[Галерея Рустама Жураєва] Підтвердження бронювання: «{sculpture_title}» ({reservation_code})"
        if is_inquiry:
            subject = f"[Галерея Рустама Жураєва] Запит отримано: «{sculpture_title}» ({reservation_code})"

        action_heading = "Запит отримано" if is_inquiry else "Скульптуру успішно заброньовано"
        status_text = (
            f"Ваш запит на створення авторської варіації за мотивами скульптури «{sculpture_title}» успішно зареєстровано."
            if is_inquiry
            else f"Оригінальну скульптуру «{sculpture_title}» успішно зарезервовано за вами."
        )

        plain_text = f"""ГАЛЕРЕЯ НАЇВНОГО МИСТЕЦТВА — РУСТАМ ЖУРАЄВ
============================================================
{action_heading}: {reservation_code}

Вітаємо, {buyer_name}!

Дякуємо за ваш інтерес до авторської кам'яної скульптури у традиції українського наївного мистецтва.
{status_text}

ДЕТАЛІ БРОНЮВАННЯ:
------------------------------------------------------------
- Скульптура: {sculpture_title}
- Вартість: {price_uah:n} ₴
- Код бронювання: {reservation_code}
- Бажаний спосіб зв'язку: {channel_desc}
- Місто та служба доставки: {delivery_city} ({delivery_method})

ЩО ВІДБУВАЄТЬСЯ ДАЛІ:
------------------------------------------------------------
Скульптор Рустам Жураєв найближчим часом особисто зв'яжеться з вами через {channel_desc}, щоб узгодити безпечне музейне пакування, терміни доставки та надати реквізити для оплати на картку. На сайті жодних автоматичних списань не здійснюється.

ПРЯМІ КОНТАКТИ АВТОРА:
- Telegram: https://t.me/zhsculptures (@zhsculptures)
- Email: {settings.SES_SENDER_EMAIL}

З повагою,
Галерея кам'яної скульптури Рустама Жураєва
"""

        h_status_text = (
            f"Ваш запит на створення авторської варіації за мотивами скульптури «{h_sculpture_title}» успішно зареєстровано."
            if is_inquiry
            else f"Оригінальну скульптуру «{h_sculpture_title}» успішно зарезервовано за вами."
        )
        html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{html.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181B; line-height: 1.6;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E4DFD7; padding: 40px 32px; border-radius: 4px;">
    
    <div style="border-bottom: 1px solid #E4DFD7; padding-bottom: 20px; margin-bottom: 30px;">
      <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #71717A; display: block; margin-bottom: 6px;">Галерея Наївного Мистецтва</span>
      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: 500; color: #18181B;">Рустам Жураєв</h1>
    </div>

    <div style="display: inline-block; background-color: #F3EFEA; border: 1px solid #E4DFD7; padding: 4px 12px; font-size: 12px; font-weight: 600; font-family: monospace; color: #18181B; margin-bottom: 20px; border-radius: 2px;">
      Код замовлення: {h_reservation_code}
    </div>

    <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 500; margin-top: 0; margin-bottom: 12px; color: #2E5A36;">
      {action_heading}
    </h2>

    <p style="font-size: 14px; color: #3F3F46; margin-bottom: 20px;">
      Шановний(-а) <strong>{h_buyer_name}</strong>,<br>
      Дякуємо за ваш інтерес до авторської кам'яної пластики ручної роботи. {h_status_text}
    </p>

    <div style="background-color: #FAF8F5; border: 1px solid #E4DFD7; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #71717A; width: 40%;">Скульптура:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #18181B;">{h_sculpture_title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717A;">Сума:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #18181B;">{price_uah:n} ₴</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717A;">Доставка:</td>
          <td style="padding: 6px 0; color: #18181B;">{h_delivery_city} ({h_delivery_method})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717A;">Зв'язок:</td>
          <td style="padding: 6px 0; color: #18181B;">{h_channel_desc}</td>
        </tr>
      </table>
    </div>

    <div style="border-left: 2px solid #2E5A36; padding-left: 16px; margin: 24px 0;">
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #71717A; margin: 0 0 6px 0;">Що відбувається далі:</h3>
      <p style="font-size: 13px; color: #52525B; margin: 0;">
        Автор особисто зв'яжеться з вами через <strong>{h_channel_desc}</strong> для узгодження безпечного транспортування каменю, деталей пакування та реквізитів оплати на картку.
      </p>
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E4DFD7; font-size: 12px; color: #71717A;">
      <p style="margin: 4px 0;"><strong>Бажаєте зв'язатися з автором напряму?</strong></p>
      <p style="margin: 4px 0;">Telegram: <a href="https://t.me/zhsculptures" style="color: #18181B; font-weight: 500;">@zhsculptures</a> &bull; Email: <a href="mailto:{settings.SES_SENDER_EMAIL}" style="color: #18181B; font-weight: 500;">{settings.SES_SENDER_EMAIL}</a></p>
    </div>

  </div>
</body>
</html>"""

    return {"subject": subject, "text": plain_text, "html": html_body}


def send_order_notification(order: Dict[str, Any]) -> bool:
    """
    Sends an order reservation alert directly to the artist's inbox
    (sculptures.zh@gmail.com) via Amazon SES / SMTP, and publishes to SNS if configured.
    """
    artist_email = settings.ARTIST_NOTIFICATION_EMAIL or "sculptures.zh@gmail.com"
    subject = (
        f"[Галерея Наїву] Нова бронь: {order.get('sculpture_title_ua')} ({order.get('reservation_code')})"
        if not order.get("is_inquiry")
        else f"[Галерея Наїву] Запит на роботу: {order.get('sculpture_title_ua')} ({order.get('reservation_code')})"
    )
    if len(subject) > 95:
        subject = subject[:92] + "..."

    plain_text = format_order_notification_email(order)
    html_body = format_artist_order_notification_html(order)

    # 1. Direct email to artist inbox via SMTP if configured
    if settings.SMTP_HOST:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SES_SENDER_EMAIL
            msg["To"] = artist_email
            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SES_SENDER_EMAIL, [artist_email], msg.as_string())
            server.quit()
            logger.info(f"Dispatched artist reservation alert via SMTP to {artist_email}")
        except Exception as e:
            logger.error(f"SMTP artist notification failed: {e}")

    # 2. Direct email to artist inbox via Amazon SES
    try:
        ses = get_ses_client()
        response = ses.send_email(
            Source=settings.SES_SENDER_EMAIL,
            Destination={"ToAddresses": [artist_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": plain_text, "Charset": "UTF-8"},
                    "Html": {"Data": html_body, "Charset": "UTF-8"},
                },
            },
        )
        logger.info(f"Dispatched artist alert via SES to {artist_email}, MessageId: {response.get('MessageId')}")
    except Exception as e:
        logger.info(
            f"SES delivery to artist {artist_email} unavailable or local environment ({e}). Logged artist alert for {order.get('reservation_code')}:\n{plain_text}"
        )

    # 3. Publish to Amazon SNS Topic (if topic is configured)
    topic_arn = settings.SNS_TOPIC_ARN
    if topic_arn:
        try:
            sns = get_sns_client()
            sns.publish(
                TopicArn=topic_arn,
                Subject=subject,
                Message=plain_text
            )
            logger.info(f"Published SNS alert to topic {topic_arn}")
        except Exception as e:
            logger.error(f"SNS publish failed: {e}")

    return True


def send_buyer_confirmation_email(order: Dict[str, Any]) -> bool:
    """
    Sends a localized confirmation email to the buyer via Amazon SES or SMTP.
    In local dev / test mode without SES/SMTP, safely logs the formatted message.
    """
    buyer_email = order.get("email")
    if not buyer_email or "@" not in buyer_email:
        logger.warning(f"No valid buyer email provided for order {order.get('id')}")
        return False

    formatted = format_buyer_confirmation_email(order)
    subject = formatted["subject"]
    plain_text = formatted["text"]
    html_body = formatted["html"]

    # 1. Option: Custom SMTP server (if configured in environment)
    if settings.SMTP_HOST:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SES_SENDER_EMAIL
            msg["To"] = buyer_email
            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SES_SENDER_EMAIL, [buyer_email], msg.as_string())
            server.quit()
            logger.info(f"Sent buyer confirmation email via SMTP to {buyer_email}")
            return True
        except Exception as e:
            logger.error(f"SMTP email dispatch failed: {e}")

    # 2. Option: Amazon SES (AWS Production)
    try:
        ses = get_ses_client()
        response = ses.send_email(
            Source=settings.SES_SENDER_EMAIL,
            Destination={"ToAddresses": [buyer_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": plain_text, "Charset": "UTF-8"},
                    "Html": {"Data": html_body, "Charset": "UTF-8"},
                },
            },
        )
        logger.info(f"Dispatched buyer confirmation via SES to {buyer_email}, MessageId: {response.get('MessageId')}")
        return True
    except Exception as e:
        logger.info(
            f"SES delivery unavailable or local environment ({e}). Logged buyer confirmation for {buyer_email}:\n"
            f"Subject: {subject}\n{plain_text}"
        )
        return True

