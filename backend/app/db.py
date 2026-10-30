"""
DynamoDB repository with atomic condition expressions, transactional operations,
and local in-memory fallback for development and automated testing.
"""
import uuid
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Dict, Any
import boto3
from botocore.exceptions import ClientError
from app.config import settings
from app.seed_data import SEED_SCULPTURES

logger = logging.getLogger(__name__)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def floats_to_decimals(obj: Any) -> Any:
    """Recursively converts float values to Decimal for DynamoDB storage."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: floats_to_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [floats_to_decimals(v) for v in obj]
    return obj


def decimals_to_floats(obj: Any) -> Any:
    """Recursively converts Decimal values back to float/int for JSON serialization."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif isinstance(obj, dict):
        return {k: decimals_to_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimals_to_floats(v) for v in obj]
    return obj


def get_dynamodb_resource():
    """Initializes boto3 DynamoDB resource."""
    return boto3.resource("dynamodb", region_name=settings.AWS_REGION)


# ==============================================================================
# IN-MEMORY DEV STORE (Used when AWS DynamoDB is unavailable or in mock mode)
# ==============================================================================
class InMemoryStore:
    def __init__(self):
        self.sculptures: Dict[str, Dict[str, Any]] = {}
        self.orders: Dict[str, Dict[str, Any]] = {}
        self._init_seed_data()

    def _init_seed_data(self):
        for item in SEED_SCULPTURES:
            self.sculptures[item["id"]] = dict(item)

    def reset(self):
        self.sculptures.clear()
        self.orders.clear()
        self._init_seed_data()


dev_store = InMemoryStore()


# ==============================================================================
# SCULPTURE REPOSITORY
# ==============================================================================
class SculptureRepository:
    def __init__(self):
        self._fallback_mock = False
        self._table = None

    @property
    def use_mock(self) -> bool:
        return settings.USE_LOCAL_MOCK_DATA or self._fallback_mock

    @use_mock.setter
    def use_mock(self, val: bool):
        self._fallback_mock = val

    def _get_table(self):
        if self._table is None and not self.use_mock:
            try:
                dynamodb = get_dynamodb_resource()
                self._table = dynamodb.Table(settings.SCULPTURES_TABLE)
                # Quick verification call
                self._table.load()
            except Exception as e:
                logger.warning(f"DynamoDB SculpturesTable unavailable ({e}). Using local in-memory store.")
                self.use_mock = True
        return self._table

    def list_sculptures(
        self,
        status: Optional[str] = None,
        material: Optional[str] = None,
        include_sold: bool = True
    ) -> List[Dict[str, Any]]:
        table = self._get_table()
        if self.use_mock or table is None:
            results = list(dev_store.sculptures.values())
            if status:
                results = [s for s in results if s.get("status") == status]
            elif not include_sold:
                results = [s for s in results if s.get("status") != "SOLD"]
            if material:
                material_clean = material.lower().strip()
                results = [
                    s for s in results
                    if material_clean in s.get("material_ua", "").lower()
                    or material_clean in s.get("material_en", "").lower()
                ]
            results.sort(key=lambda x: x.get("display_order", 0))
            return results

        try:
            # DynamoDB Scan or Index Query
            if status:
                response = table.query(
                    IndexName="StatusIndex",
                    KeyConditionExpression="#st = :st",
                    ExpressionAttributeNames={"#st": "status"},
                    ExpressionAttributeValues={":st": status}
                )
                items = response.get("Items", [])
            else:
                response = table.scan()
                items = response.get("Items", [])
                if not include_sold:
                    items = [s for s in items if s.get("status") != "SOLD"]

            if material:
                mat_clean = material.lower().strip()
                items = [
                    s for s in items
                    if mat_clean in s.get("material_ua", "").lower()
                    or mat_clean in s.get("material_en", "").lower()
                ]

            items = [decimals_to_floats(s) for s in items]
            items.sort(key=lambda x: x.get("display_order", 0))
            return items
        except ClientError as e:
            logger.error(f"Error querying sculptures: {e}")
            return list(dev_store.sculptures.values())

    def get_by_id(self, sculpture_id: str) -> Optional[Dict[str, Any]]:
        table = self._get_table()
        if self.use_mock or table is None:
            return dev_store.sculptures.get(sculpture_id)

        try:
            response = table.get_item(Key={"id": sculpture_id})
            item = response.get("Item")
            return decimals_to_floats(item) if item else None
        except ClientError as e:
            logger.error(f"Error fetching sculpture {sculpture_id}: {e}")
            return dev_store.sculptures.get(sculpture_id)

    def get_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        table = self._get_table()
        if self.use_mock or table is None:
            for s in dev_store.sculptures.values():
                if s.get("slug") == slug:
                    return s
            return None

        try:
            response = table.query(
                IndexName="SlugIndex",
                KeyConditionExpression="slug = :slug",
                ExpressionAttributeValues={":slug": slug}
            )
            items = response.get("Items", [])
            return decimals_to_floats(items[0]) if items else None
        except ClientError as e:
            logger.error(f"Error querying slug {slug}: {e}")
            for s in dev_store.sculptures.values():
                if s.get("slug") == slug:
                    return s
            return None

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        sculpture_id = f"sculpt-{uuid.uuid4().hex[:8]}"
        now = _utc_now_iso()
        item = {
            **data,
            "id": sculpture_id,
            "created_at": now,
            "updated_at": now
        }

        table = self._get_table()
        if self.use_mock or table is None:
            dev_store.sculptures[sculpture_id] = item
            return item

        try:
            table.put_item(Item=floats_to_decimals(item))
            return item
        except ClientError as e:
            logger.error(f"Error creating sculpture: {e}")
            dev_store.sculptures[sculpture_id] = item
            return item

    def update(self, sculpture_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = self.get_by_id(sculpture_id)
        if not existing:
            return None

        now = _utc_now_iso()
        updates["updated_at"] = now
        merged = {**existing, **updates}

        table = self._get_table()
        if self.use_mock or table is None:
            dev_store.sculptures[sculpture_id] = merged
            return merged

        try:
            table.put_item(Item=floats_to_decimals(merged))
            return merged
        except ClientError as e:
            logger.error(f"Error updating sculpture {sculpture_id}: {e}")
            dev_store.sculptures[sculpture_id] = merged
            return merged

    def delete(self, sculpture_id: str) -> bool:
        table = self._get_table()
        if self.use_mock or table is None:
            if sculpture_id in dev_store.sculptures:
                del dev_store.sculptures[sculpture_id]
                return True
            return False

        try:
            table.delete_item(Key={"id": sculpture_id})
            if sculpture_id in dev_store.sculptures:
                del dev_store.sculptures[sculpture_id]
            return True
        except ClientError as e:
            logger.error(f"Error deleting sculpture {sculpture_id}: {e}")
            return False


# ==============================================================================
# ORDER REPOSITORY WITH ATOMIC RESERVATION LOCK
# ==============================================================================
class OrderRepository:
    def __init__(self):
        self._fallback_mock = False
        self._table = None

    @property
    def use_mock(self) -> bool:
        return settings.USE_LOCAL_MOCK_DATA or self._fallback_mock

    @use_mock.setter
    def use_mock(self, val: bool):
        self._fallback_mock = val

    def _get_table(self):
        if self._table is None and not self.use_mock:
            try:
                dynamodb = get_dynamodb_resource()
                self._table = dynamodb.Table(settings.ORDERS_TABLE)
                self._table.load()
            except Exception as e:
                logger.warning(f"DynamoDB OrdersTable unavailable ({e}). Using local in-memory store.")
                self.use_mock = True
        return self._table

    def list_orders(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        table = self._get_table()
        if self.use_mock or table is None:
            results = list(dev_store.orders.values())
            if status:
                results = [o for o in results if o.get("status") == status]
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return results

        try:
            if status:
                response = table.query(
                    IndexName="StatusCreatedAtIndex",
                    KeyConditionExpression="#st = :st",
                    ExpressionAttributeNames={"#st": "status"},
                    ExpressionAttributeValues={":st": status},
                    ScanIndexForward=False
                )
            else:
                response = table.scan()
            items = response.get("Items", [])
            items = [decimals_to_floats(o) for o in items]
            items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return items
        except ClientError as e:
            logger.error(f"Error querying orders: {e}")
            results = list(dev_store.orders.values())
            if status:
                results = [o for o in results if o.get("status") == status]
            results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return results

    def get_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        table = self._get_table()
        if self.use_mock or table is None:
            return dev_store.orders.get(order_id)

        try:
            resp = table.get_item(Key={"id": order_id})
            item = resp.get("Item")
            return decimals_to_floats(item) if item else None
        except ClientError as e:
            logger.error(f"Error fetching order {order_id}: {e}")
            return dev_store.orders.get(order_id)

    def create_order_atomic(
        self,
        order_input: Dict[str, Any],
        sculpture: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atomically reserves the sculpture and records the acquisition order.
        If sculpture is already RESERVED or SOLD (for non-inquiry orders),
        raises ValueError indicating conflict.
        """
        order_id = f"ord-{uuid.uuid4().hex[:10]}"
        reservation_code = f"NSG-{uuid.uuid4().hex[:5].upper()}"
        now = _utc_now_iso()
        is_inquiry = order_input.get("is_inquiry", False)
        sculpture_id = sculpture["id"]

        order_record = {
            "id": order_id,
            "reservation_code": reservation_code,
            "sculpture_id": sculpture_id,
            "sculpture_title_ua": sculpture.get("title_ua", "Скульптура"),
            "sculpture_title_en": sculpture.get("title_en", "Sculpture"),
            "price_uah": sculpture.get("price_uah", 0),
            "is_inquiry": is_inquiry,
            "buyer_name": order_input["buyer_name"],
            "contact_channel": order_input["contact_channel"],
            "telegram_handle": order_input.get("telegram_handle"),
            "email": order_input.get("email"),
            "delivery_city_country": order_input["delivery_city_country"],
            "delivery_method": order_input["delivery_method"],
            "comment": order_input.get("comment"),
            "status": "PENDING_COORDINATION",
            "admin_notes": "",
            "created_at": now,
            "updated_at": now
        }

        # ----------------------------------------------------------------------
        # MOCK / LOCAL DEV BRANCH
        # ----------------------------------------------------------------------
        table = self._get_table()
        if self.use_mock or table is None:
            if not is_inquiry:
                current_status = sculpture.get("status")
                if current_status != "AVAILABLE":
                    raise ValueError(
                        f"Скульптуру вже заброньовано або продано (статус: {current_status}). "
                        f"Неможливо оформити пряму бронь."
                    )
                # Atomically update local store sculpture status
                if sculpture_id in dev_store.sculptures:
                    dev_store.sculptures[sculpture_id]["status"] = "RESERVED"
                    dev_store.sculptures[sculpture_id]["updated_at"] = now
            dev_store.orders[order_id] = order_record
            return order_record

        # ----------------------------------------------------------------------
        # DYNAMODB ATOMIC TRANSACTION / CONDITIONAL WRITE BRANCH
        # ----------------------------------------------------------------------
        dynamodb_client = boto3.client("dynamodb", region_name=settings.AWS_REGION)

        if not is_inquiry:
            # Atomic transaction: Update sculpture to RESERVED with condition status=AVAILABLE,
            # and Insert order into OrdersTable
            try:
                dynamodb_client.transact_write_items(
                    TransactItems=[
                        {
                            "Update": {
                                "TableName": settings.SCULPTURES_TABLE,
                                "Key": {"id": {"S": sculpture_id}},
                                "UpdateExpression": "SET #st = :reserved, #up = :now",
                                "ConditionExpression": "#st = :available",
                                "ExpressionAttributeNames": {
                                    "#st": "status",
                                    "#up": "updated_at"
                                },
                                "ExpressionAttributeValues": {
                                    ":reserved": {"S": "RESERVED"},
                                    ":available": {"S": "AVAILABLE"},
                                    ":now": {"S": now}
                                }
                            }
                        },
                        {
                            "Put": {
                                "TableName": settings.ORDERS_TABLE,
                                "Item": {
                                    "id": {"S": order_id},
                                    "reservation_code": {"S": reservation_code},
                                    "sculpture_id": {"S": sculpture_id},
                                    "sculpture_title_ua": {"S": order_record["sculpture_title_ua"]},
                                    "sculpture_title_en": {"S": order_record["sculpture_title_en"]},
                                    "price_uah": {"N": str(order_record["price_uah"])},
                                    "is_inquiry": {"BOOL": False},
                                    "buyer_name": {"S": order_record["buyer_name"]},
                                    "contact_channel": {"S": str(order_record["contact_channel"])},
                                    "telegram_handle": {"S": order_record["telegram_handle"] or ""},
                                    "email": {"S": order_record["email"] or ""},
                                    "delivery_city_country": {"S": order_record["delivery_city_country"]},
                                    "delivery_method": {"S": order_record["delivery_method"]},
                                    "comment": {"S": order_record["comment"] or ""},
                                    "status": {"S": "PENDING_COORDINATION"},
                                    "created_at": {"S": now},
                                    "updated_at": {"S": now}
                                }
                            }
                        }
                    ]
                )
                return order_record
            except ClientError as e:
                code = e.response.get("Error", {}).get("Code")
                if code == "TransactionCanceledException":
                    raise ValueError("Скульптуру щойно було заброньовано іншим шанувальником наїву.")
                logger.error(f"DynamoDB Transaction failed: {e}")
                # Fallback to local dev store
                dev_store.orders[order_id] = order_record
                return order_record
        else:
            # For general inquiry, just record order without locking sculpture
            try:
                table.put_item(Item=floats_to_decimals(order_record))
                return order_record
            except ClientError as e:
                logger.error(f"Error creating inquiry order: {e}")
                dev_store.orders[order_id] = order_record
                return order_record

    def update_status(
        self,
        order_id: str,
        new_status: str,
        admin_notes: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Updates order status and triggers corresponding sculpture status changes:
        - PAID -> Sculpture becomes SOLD
        - CANCELLED -> Sculpture returns to AVAILABLE
        - SHIPPED -> Sculpture remains SOLD, order updated
        """
        order = self.get_by_id(order_id)
        if not order:
            return None

        sculpture_id = order.get("sculpture_id")
        now = _utc_now_iso()
        order["status"] = new_status
        order["updated_at"] = now
        if admin_notes is not None:
            order["admin_notes"] = admin_notes

        # Determine if sculpture status must change
        sculpture_repo = SculptureRepository()

        if new_status == "PAID":
            sculpture_repo.update(sculpture_id, {"status": "SOLD"})
        elif new_status == "CANCELLED":
            sculpture_repo.update(sculpture_id, {"status": "AVAILABLE"})

        table = self._get_table()
        if self.use_mock or table is None:
            dev_store.orders[order_id] = order
            return order

        try:
            table.put_item(Item=floats_to_decimals(order))
            return order
        except ClientError as e:
            logger.error(f"Error updating order {order_id}: {e}")
            dev_store.orders[order_id] = order
            return order


sculpture_repo = SculptureRepository()
order_repo = OrderRepository()
