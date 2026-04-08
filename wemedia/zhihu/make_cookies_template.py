#!/usr/bin/env python3
"""
Local-only helper to write wemedia/zhihu/cookies.json from a pasted document.cookie string.

Usage:
1. Paste your browser's document.cookie value into COOKIE_STRING below.
2. Run:
   python3 /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/make_cookies_template.py
3. It will write:
   /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/cookies.json
"""

from __future__ import annotations

import json
from pathlib import Path


COOKIE_STRING = """
'z_c0=2|1:0|10:1775306200|4:z_c0|92:Mi4xVTVjR0NBQUFBQUJ1NFZOdXNBZ0ZHeVlBQUFCZ0FsVk5Bcm0zYWdDdlpEc2FGTE4wakJVVVJPQlNSQ1JVbmtOTXJ3|73d4010aab64a4d33371d0836335e681a2d5f5741cd606097d23569a85d65129; _zap=3574af39-fef6-40fd-9908-b602292d1172; d_c0=buFTbrAIBRuPTkBrqc8bxvCwatYu7laC1-k=|1756974290; q_c1=804cb6fe155a4e5d9bfc3d1b729837bc|1757573722000|1757573722000; _xsrf=xy3Vr3OfYaX1p705QSaStrELvW58aeKq; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1775181734,1775296076,1775300387,1775389545; HMACCOUNT=93CE21CAC37CAB7A; __zse_ck=005_Zq=forB4y/eErb/UUrRASdvqIj3I4VWDoCRNWixi=9vO0gndGKSW0oyHEeWoWU7S9miq78BrrDcAqYSEXgIIOir9VqFHWpl/7KR1paHO=qfmq8pj6yrT1irb0Po9BpOH-xbxwyuRIbCF+qlMMoS825ftgsq8orTPiPcE6/B0s6Bf3YQMp9r/sFHFKnHb1g1etVpT4p+5e0Rxpvds94E4fSIAoXJ4vN/B9BbEIeTbhh8FzyCrtIdxo62zWbnfzlKXaLr6f21Hzf5D2XMaOnw0I+GUnau1Hbuei2xUt4enAQBo=; SESSIONID=UWUvImbtWZ3arLAjxw8bI3EtsNHP0fleTx4ANawxfJt; JOID=UlwRBUnwDUijHF-lEoIeWOF-vaoNoVof0Vc2x2SlU3vAahHgeAAbmMwaW6cUmSLZJ1UaCO3ZZQsadjIPVtiExJM=; osd=W1gVAUL5CUynF1ahFoYVUeV6uaEEpV4b2l4yw2CuWn_EbhrpfAQfk8UeX6MfkCbdI14TDOndbgIecjYEX9yAwJg=; SUBMIT_0=a94b23ec-4649-4a27-93ff-abdf4b294dd8; BEC=ec64a27f4feb1b29e8161db426d61998; Hm_lpvt_98beee57fd2ef70ccdd5ca52b9740c49=1775638338'
""".strip()

REQUIRED_NAMES = ["z_c0", "SESSIONID", "_xsrf", "d_c0"]


def build_cookie(name: str, value: str) -> dict:
    return {
        "name": name,
        "value": value,
        "domain": ".zhihu.com",
        "path": "/",
        "httpOnly": False,
        "secure": True,
    }


def parse_cookie_string(cookie_string: str) -> dict[str, str]:
    cookie_string = cookie_string.strip()
    if not cookie_string or "PASTE_DOCUMENT_COOKIE_HERE" in cookie_string:
        raise SystemExit("Please paste your document.cookie string into COOKIE_STRING first.")

    if cookie_string.startswith("document.cookie"):
        cookie_string = cookie_string[len("document.cookie") :].strip()

    if (cookie_string.startswith('"') and cookie_string.endswith('"')) or (
        cookie_string.startswith("'") and cookie_string.endswith("'")
    ):
        cookie_string = cookie_string[1:-1]

    pairs: dict[str, str] = {}
    for chunk in cookie_string.split(";"):
        piece = chunk.strip()
        if not piece or "=" not in piece:
            continue
        name, value = piece.split("=", 1)
        pairs[name.strip()] = value.strip()
    return pairs


def main() -> None:
    parsed = parse_cookie_string(COOKIE_STRING)
    missing = [name for name in REQUIRED_NAMES if not parsed.get(name)]
    if missing:
        raise SystemExit(f"Missing required cookies: {', '.join(missing)}")

    cookies = [build_cookie(name, parsed[name]) for name in REQUIRED_NAMES]
    out_path = Path(__file__).with_name("cookies.json")
    out_path.write_text(json.dumps(cookies, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
