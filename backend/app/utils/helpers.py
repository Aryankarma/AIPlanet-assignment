from app.db.database import users_collection, tokens_collection
import logging

ASSISTANT_NAME="default"

async def get_primary_assistant(email: str) -> str:
    """Get a user's primary assistant from email"""
    try:
        # find the user
        print("finding user with email", email)
        user = await users_collection.find_one({"email": email})
        if user:
            print("found user.")
            print(user["name"]) 
            if "primary_assistant" in user:
                print("got primary assistant in db", user["primary_assistant"])
                return user["primary_assistant"]
            else:
                print("unable to find primary assistant in db.")
                return ASSISTANT_NAME
        else:
            print("User not found.")
            return ASSISTANT_NAME
            
    except Exception as e:
        logging.error(f"Error getting primary assistant: {str(e)}")
        return ASSISTANT_NAME


async def update_primary_assistant(email: str, assistantName: str) -> bool:
    """Updates a user's primary assistant in the DB"""
    print("updating primary assistant for:", email, assistantName)
    try:
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {"primary_assistant": assistantName}}
        )
        print("result:", result)

        if result.matched_count == 0:
            logging.error(f"No matching user found for email: {email}")
            return False

        logging.info(f"Updated primary assistant: {result.modified_count}")
        return result.modified_count > 0

    except Exception as e:
        logging.error(f"Error updating primary assistant: {str(e)}")
        return False