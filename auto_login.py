import asyncio
import json
from pathlib import Path
from uuid import uuid4

from loguru import logger

from modules.api import KuroLoginClient
from modules.api.utils import generate_random_device
from modules.geetest import Geetest

current_path = Path(__file__).resolve().parent
save_path = current_path / "login_info.json"

CAPTURE_ID = "3f7e2d848ce0cb7e7d019d621e556ce2"


async def async_input(prompt: str = "") -> str:
    return await asyncio.to_thread(input, prompt)


async def main():
    try:
        phone_number = await async_input("Enter your mobile number: ")

        sec_code = None
        async with Geetest(CAPTURE_ID) as geetest:
            sec_code = await geetest.fetch_sec_code()

        if sec_code is None:
            raise RuntimeError("未取得Sec code, 验证码未通过")

        async with KuroLoginClient() as client:
            await client.send_sms_code(phone_number, sec_code)

            sms_code = await async_input("Enter the SMS code: ")

            user_session = await client.sdk_login(phone_number, sms_code)

            client.token = user_session.token

            role_session = await client.fetch_role_session()

            meta = user_session.model_dump() | role_session.model_dump() | {
                "device_id": generate_random_device(),
                "distinct_id": str(uuid4())
            }

            logger.success(f"Get login Info ==> \n{meta}")

            save_path.write_text(data=json.dumps(obj=meta, ensure_ascii=False, indent=4), encoding="utf-8")

            logger.success(f"The info has written in {save_path.name}")



    except RuntimeError as e:
        logger.error(f"运行时发生错误: {e}")

    except Exception as e:
        logger.error(f"发生未知错误: {e}")


if __name__ == '__main__':
    asyncio.run(main())
