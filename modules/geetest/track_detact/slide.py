import asyncio
from typing import Any
from urllib.parse import urljoin

import cv2
import httpx
import numpy as np


def _calculate_slide_distance_cv2(bg_bytes: bytes, target_bytes: bytes) -> int:
    bg_arr = np.frombuffer(bg_bytes, np.uint8)
    target_arr = np.frombuffer(target_bytes, np.uint8)

    bg_img = cv2.imdecode(bg_arr, cv2.IMREAD_COLOR)
    target_img = cv2.imdecode(target_arr, cv2.IMREAD_COLOR)

    bg_gray = cv2.cvtColor(bg_img, cv2.COLOR_BGR2GRAY)
    target_gray = cv2.cvtColor(target_img, cv2.COLOR_BGR2GRAY)

    bg_edges = cv2.Canny(bg_gray, 100, 200)
    target_edges = cv2.Canny(target_gray, 100, 200)

    res = cv2.matchTemplate(bg_edges, target_edges, cv2.TM_CCOEFF_NORMED)

    _, max_val, _, max_loc = cv2.minMaxLoc(res)

    return max_loc[0]


async def get_slide_distance(bgPath: str, slicePath: str, client: httpx.AsyncClient) -> int:
    """
    异步下载图片并计算距离
    """
    domain = "https://static.geetest.com/"
    target_url = urljoin(domain, slicePath)
    bg_url = urljoin(domain, bgPath)

    try:
        target_resp, bg_resp = await asyncio.gather(
            client.get(target_url),
            client.get(bg_url)
        )
        target_resp.raise_for_status()
        bg_resp.raise_for_status()
    except httpx.HTTPError as e:
        raise Exception(f"下载极验图片失败: {e}")

    distance = await asyncio.to_thread(
        _calculate_slide_distance_cv2,
        bg_resp.content,
        target_resp.content
    )

    return distance


async def get_track(
        geetest_info: dict[str, Any],
        message: str,
        sign: str,
        client: httpx.AsyncClient
) -> dict[str, Any]:
    slide_distance = await get_slide_distance(
        geetest_info["bg"],
        geetest_info["slice"],
        client
    )

    return {
        "setLeft": slide_distance,
        "passtime": 1718,
        "userresponse": slide_distance / 1.0059466666666665 + 2,
        "device_id": "",
        "lot_number": geetest_info["lot_number"],
        "pow_msg": message,
        "pow_sign": sign,
        "geetest": "captcha",
        "lang": "zh",
        "ep": "123",
        "biht": "1426265548",
        "dRjQ": "738u",
        "em": {"ph": 0, "cp": 0, "ek": "11", "wd": 1, "nt": 0, "si": 0, "sc": 0},
    }
