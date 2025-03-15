from dotenv import load_dotenv
from pinecone import Pinecone
import os

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

assistant = pc.assistant.Assistant(
    assistant_name="default", 
)

files = assistant.list_files()

# print("files before deleting")
print(files)

print("")
print("")

for file in files:
    print(file)
    # print(file.name)
    # print(file.id)
    # print("    ")

# assistant.delete_file(file_id="4cbf8571")

# print("printing after deleting")

# files = assistant.list_files()


# for file in files:
#     print(file.name)
#     print(file.id)
#     print("    ")
