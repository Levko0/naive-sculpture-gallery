#!/usr/bin/env python3
"""
Seed DynamoDB with authentic Naive Art sculptures.
"""
import sys
import argparse
import boto3
from app.seed_data import SEED_SCULPTURES
from app.db import floats_to_decimals


def seed_database(table_name: str, region: str = "eu-central-1"):
    print(f"🌱 Seeding DynamoDB table '{table_name}' in {region}...")
    dynamodb = boto3.resource("dynamodb", region_name=region)
    table = dynamodb.Table(table_name)

    # Check if already populated
    scan_resp = table.scan(Limit=1)
    if scan_resp.get("Count", 0) > 0:
        print(f"ℹ️ Table '{table_name}' already contains data. Skipping initial seed.")
        return

    count = 0
    with table.batch_writer() as batch:
        for sculpture in SEED_SCULPTURES:
            batch.put_item(Item=floats_to_decimals(sculpture))
            count += 1
            print(f"  ✓ Added: {sculpture.get('title_ua')} ({sculpture.get('id')})")

    print(f"🎉 Successfully seeded {count} sculptures into '{table_name}'!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed DynamoDB Sculptures Table")
    parser.add_argument("--table", required=True, help="DynamoDB Table Name")
    parser.add_argument("--region", default="eu-central-1", help="AWS Region")
    args = parser.parse_args()

    seed_database(args.table, args.region)
