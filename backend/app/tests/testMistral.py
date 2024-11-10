import os
from langchain_core.messages import HumanMessage
from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")


model = ChatMistralAI(api_key=MISTRAL_API_KEY, model="mistral-large-latest")
response = model.invoke([HumanMessage(content="hey! what's up?")])
print(response.content)