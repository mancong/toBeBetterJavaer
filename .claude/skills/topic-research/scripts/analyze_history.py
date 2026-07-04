#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读取 ai-article/references/gongzhonghao.xlsx，输出历史文章表现数据。
输出格式（TAB 分隔，按打开率倒序）：
打开率%  分享率%  阅读数  发表日期  标题
打开率 = 阅读人数/送达人数，分享率 = 分享人数/阅读人数（传播力信号）"""

import os
import sys

try:
    import openpyxl
except ImportError:
    print("缺少 openpyxl，请先执行: pip3 install openpyxl")
    sys.exit(1)

XLSX_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "ai-article", "references", "gongzhonghao.xlsx",
)


def load_rows(path):
    if not os.path.exists(path):
        print(f"找不到数据文件: {path}")
        sys.exit(1)

    wb = openpyxl.load_workbook(path)
    ws = wb.active
    rows = []
    for row in ws.iter_rows(values_only=True):
        vals = list(row)
        # 列结构：_, 标题, 发表日期, 阅读人数, 分享人数, 关注数, 送达人数, ...
        if len(vals) < 7 or vals[1] is None or vals[3] is None:
            continue
        title = str(vals[1]).strip()
        if not title or "\n" in title or len(title) > 100:
            continue
        try:
            reads = int(float(vals[3]))
            shares = int(float(vals[4] or 0))
            delivered = int(float(vals[6] or 0))
        except (ValueError, TypeError):
            continue  # 表头等非数据行
        date = str(vals[2] or "").strip()
        open_rate = reads / delivered * 100 if delivered > 0 else 0.0
        share_rate = shares / reads * 100 if reads > 0 else 0.0
        rows.append((open_rate, share_rate, reads, date, title))
    return rows


def main():
    rows = sorted(load_rows(XLSX_PATH), reverse=True)
    print("打开率%\t分享率%\t阅读数\t发表日期\t标题")
    for open_rate, share_rate, reads, date, title in rows:
        print(f"{open_rate:.2f}\t{share_rate:.2f}\t{reads}\t{date}\t{title}")


if __name__ == "__main__":
    main()
