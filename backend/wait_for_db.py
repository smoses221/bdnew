import os
import time
import sys
from sqlalchemy import create_engine


def wait_for_db(url, timeout=60, interval=2):
    engine = create_engine(url)
    end = time.time() + timeout
    while time.time() < end:
        try:
            with engine.connect():
                print("Database is available")
                return True
        except Exception as e:
            print(f"Waiting for database ({e})...")
            time.sleep(interval)
    return False


def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("DATABASE_URL not set, skipping wait")
        return
    ok = wait_for_db(url)
    if not ok:
        print("Timed out waiting for the database", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
