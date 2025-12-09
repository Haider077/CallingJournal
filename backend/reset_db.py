import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

def reset_database():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return

    # Parse the URL to get credentials
    result = urlparse(db_url)
    username = result.username
    password = result.password
    host = result.hostname
    port = result.port
    dbname = result.path[1:]

    try:
        # Connect to default 'postgres' database
        con = psycopg2.connect(
            dbname='postgres',
            user=username,
            host=host,
            password=password,
            port=port
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Drop database if exists
        print(f"Dropping database {dbname}...")
        cur.execute(f"DROP DATABASE IF EXISTS {dbname}")
        
        # Create database
        print(f"Creating database {dbname}...")
        cur.execute(f"CREATE DATABASE {dbname}")
        print(f"Database {dbname} reset successfully!")
            
        cur.close()
        con.close()
        
    except Exception as e:
        print(f"Error resetting database: {e}")

if __name__ == "__main__":
    reset_database()
