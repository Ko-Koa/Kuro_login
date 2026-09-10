from types import TracebackType
from typing import Optional, Any

import httpx

from .models import UserSession, RoleSession
from .utils import device_hook

LOGIN_HEADER = {
    "Host": "api.kurobbs.com",
    "osversion": "Android",
    "countrycode": "CN",
    "model": "MIX 2",
    "source": "android",
    "lang": "zh-Hans",
    "version": "2.2.0",
    "versioncode": "2200",
    "channelid": "4",
    "content-type": "application/x-www-form-urlencoded",
    "user-agent": "okhttp/3.11.0",
}


class KuroLoginClient:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self.client = httpx.AsyncClient(timeout=10, event_hooks={
            "request": [
                device_hook,
                self._auth_hook
            ]
        })
        return self

    async def __aexit__(self, exc_type: type[BaseException] | None, exc_val: BaseException | None,
                        exc_tb: TracebackType | None):
        if self.client:
            await self.client.aclose()
            self.client = None

    async def _auth_hook(self, request: httpx.Request):
        if self.token is not None:
            request.headers['token'] = self.token

    def _ensure_client(self):
        if self.client is None:
            raise RuntimeError("Client未被初始化")

        return self.client

    async def _post(
            self,
            url: str,
            data: Optional[dict[str, Any]] = None,
            headers: Optional[dict[str, Any]] = None,
            cookies: Optional[dict[str, Any]] = None
    ):
        client = self._ensure_client()

        try:
            response = await client.post(url=url, data=data, headers=headers, cookies=cookies)
            response.raise_for_status()
            return response
        except httpx.HTTPError as e:
            raise RuntimeError(f"网络请求失败 [{url}]: {e}")

    @staticmethod
    def _response_check(response: dict[str, Any]):
        code = response.get("code", -1)
        message = response.get("msg", "未知错误")
        if code != 200:
            raise RuntimeError(message)

    async def send_sms_code(self, phone_number: str, sec_code: str):
        data = {
            "mobile": phone_number, "geeTestData": sec_code
        }

        response = await self._post(url="https://api.kurobbs.com/user/getSmsCode", data=data,
                                    headers=LOGIN_HEADER)

        self._response_check(response.json())

        return "验证码发送成功"

    async def sdk_login(self, phone_number: str, sms_code: str) -> UserSession:
        data = {
            "code": sms_code,
            "gameList": "",
            "mobile": phone_number,
        }

        response = await self._post(url="https://api.kurobbs.com/user/sdkLogin", data=data,
                                    headers=LOGIN_HEADER)

        response_data = response.json()
        self._response_check(response_data)
        return UserSession.model_validate(response_data.get("data", {}))

    async def fetch_role_session(self):
        cookies = {
            "token": self.token
        }
        data = {"type": "1", "sizeType": "2"}
        response = await self._post(url="https://api.kurobbs.com/gamer/widget/game3/getData", data=data,
                                    cookies=cookies, headers=LOGIN_HEADER)

        response_data = response.json()

        self._response_check(response_data)
        return RoleSession.model_validate(response_data.get("data", {}))
