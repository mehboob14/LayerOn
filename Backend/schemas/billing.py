from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    packageKey: str
