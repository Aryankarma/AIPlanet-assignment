from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URI, DATABASE_NAME

async def delete_database():
    client = AsyncIOMotorClient(MONGO_URI)
    await client.drop_database(DATABASE_NAME)
    print(f"Database '{DATABASE_NAME}' has been removed.")

import asyncio
asyncio.run(delete_database())
