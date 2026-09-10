from pydantic import BaseModel, ConfigDict, Field


class KuroBaseModel(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class UserSession(KuroBaseModel):
    token: str
    user_id: str = Field(alias="userId")


class RoleSession(KuroBaseModel):
    role_id: str = Field(alias="roleId")
    role_name: str = Field(alias="roleName")
    server_id: str = Field(alias="serverId")
