from pydantic import BaseModel, ConfigDict

class PDFUploadResponse(BaseModel):
    id: int
    filename: str
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
class QuestionRequest(BaseModel):
    question: StopIteration
    model_config = ConfigDict(arbitrary_types_allowed=True)
