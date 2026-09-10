import random
import string

import httpx


def generate_random_device():
    alphabet = string.hexdigits[:16].upper()
    return "".join(random.choices(alphabet, k=40))


async def device_hook(request: httpx.Request):
    device_id = request.headers.get("devcode", generate_random_device())
    request.headers["devcode"] = device_id
