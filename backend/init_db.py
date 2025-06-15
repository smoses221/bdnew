#!/usr/bin/env python3
"""
Database initialization script for BD Library
This script creates all tables and can optionally create an admin user.
"""

import sys
import os
from getpass import getpass

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine, SessionLocal
from app import models
from app.auth import get_password_hash
from datetime import datetime

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

def create_admin_user():
    """Create an admin user interactively."""
    db = SessionLocal()
    try:
        # Check if any users exist
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print("❌ Admin user already exists. Skipping user creation.")
            return

        print("\n--- Creating Admin User ---")
        username = input("Enter admin username: ").strip()
        if not username:
            print("❌ Username cannot be empty.")
            return

        email = input("Enter admin email: ").strip()
        if not email:
            print("❌ Email cannot be empty.")
            return

        password = getpass("Enter admin password: ").strip()
        if not password:
            print("❌ Password cannot be empty.")
            return

        confirm_password = getpass("Confirm password: ").strip()
        if password != confirm_password:
            print("❌ Passwords do not match.")
            return

        # Create admin user
        hashed_password = get_password_hash(password)
        admin_user = models.User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=True,
            created_at=datetime.utcnow()
        )

        db.add(admin_user)
        db.commit()
        print(f"✓ Admin user '{username}' created successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {e}")
    finally:
        db.close()

def main():
    print("BD Library Database Initialization")
    print("=" * 40)
    
    try:
        create_tables()
        
        create_user = input("\nWould you like to create an admin user? (y/N): ").strip().lower()
        if create_user in ['y', 'yes']:
            create_admin_user()
        
        print("\n✓ Database initialization completed!")
        print("\nYou can now start the server with:")
        print("  python3 -m uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
