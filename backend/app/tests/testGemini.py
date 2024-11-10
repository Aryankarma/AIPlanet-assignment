from langchain.chat_models import ChatGemini  # Hypothetical, assuming LangChain adds support
from langchain.schema import HumanMessage
from google.oauth2 import service_account

SERVICE_ACCOUNT_FILE = "path/to/your-service-account-file.json"

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

# Hypothetical LangChain Gemini model instantiation
model = ChatGemini(credentials=credentials, model="gemini-large")

# Invoke the model with a message
response = model.invoke([HumanMessage(content="Hi! I'm Bob")])

# Print the response
print(response.content)
