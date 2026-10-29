"""
SNS notification publisher for artist reservation & acquisition alerts.
Zero-config email dispatch via Amazon SNS within the AWS Free Tier.
"""
import logging
from typing import Dict, Any
import boto3
from app.config import settings

logger = logging.getLogger(__name__)


def get_sns_client():
    """Initializes standard SNS client."""
    return boto3.client("sns", region_name=settings.AWS_REGION)


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
- Telegram: {telegram_handle or "Не вказано"}
  -> Швидкий перехід у чат: {telegram_link}
- Електронна пошта: {email or "Не вказано"}
  -> Написати лист: {mailto_link}

3. ДОСТАВКА:
----------------------------------------------------
- Населений пункт / Країна: {delivery_city}
- Бажаний спосіб доставки: {delivery_method}

4. КОМЕНТАР ПОКУПЦЯ:
----------------------------------------------------
"{comment}"

----------------------------------------------------
НАСТУПНІ КРОКИ ДЛЯ ХУДОЖНИКА:
1. Зв'яжіться з покупцем через обраний ним канал (Telegram / Email).
2. Підтвердіть деталі доставки та надішліть реквізити для оплати на картку.
3. Після зарахування коштів увійдіть в панель керування (/admin) та змініть статус на "Картку оплачено" (PAID).

—
Система сповіщень Naive Art Sculpture Gallery (AWS Serverless)
"""
    return body


def send_order_notification(order: Dict[str, Any]) -> bool:
    """
    Publishes an order alert to the Amazon SNS Topic.
    If SNS_TOPIC_ARN is not configured (e.g. local dev), logs to console.
    """
    topic_arn = settings.SNS_TOPIC_ARN
    subject = (
        f"[Галерея Наїву] Нова бронь: {order.get('sculpture_title_ua')} ({order.get('reservation_code')})"
        if not order.get("is_inquiry")
        else f"[Галерея Наїву] Запит на роботу: {order.get('sculpture_title_ua')} ({order.get('reservation_code')})"
    )
    # SNS subject limit is 100 ASCII characters
    if len(subject) > 95:
        subject = subject[:92] + "..."

    message_body = format_order_notification_email(order)

    if not topic_arn:
        logger.info(
            f"SNS_TOPIC_ARN is not set. Simulating order email alert for {order.get('reservation_code')}:\n{message_body}"
        )
        return True

    try:
        sns = get_sns_client()
        response = sns.publish(
            TopicArn=topic_arn,
            Subject=subject,
            Message=message_body
        )
        logger.info(f"Published SNS alert message ID: {response.get('MessageId')}")
        return True
    except Exception as e:
        logger.error(f"Failed to publish SNS notification for order {order.get('id')}: {e}")
        # Return False but do not crash the order creation flow
        return False
