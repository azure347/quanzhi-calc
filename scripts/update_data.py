#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
  天坑劝退计算器 — 专业数据维护脚本 (update_data.py)
===============================================================================

用途：
  辅助维护 src/data/majors.json 专业数据文件。提供命令行交互菜单，支持：
    - 查看所有专业及劝退指数（默认等权重平均）
    - 修改某个专业/学历/方向的维度分数
    - 修改专业的 roast 辣评文案
    - 修改方向的 details（就业率/薪资/岗位/环境/趋势）
    - 新增细分方向
    - 自动备份 JSON 到 backups/ 目录

用法：
  python update_data.py

  脚本默认假设与 src/data/majors.json 的相对路径关系：
      scripts/update_data.py        ← 本脚本
      src/data/majors.json          ← 数据文件
      backups/                      ← 自动备份目录

依赖：
  colorama (可选) — 彩色终端输出，未安装时自动降级为纯文本

安全机制：
  - 每次修改前自动备份原 JSON 到 backups/ 目录（带时间戳）
  - 每次写入后自动校验 JSON 合法性
  - 支持交互式确认，避免误操作
===============================================================================
"""

import json
import os
import sys
import shutil
from datetime import datetime

# ── 路径配置 ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)  # quanzhi-calc/
DATA_FILE = os.path.join(PROJECT_DIR, "src", "data", "majors.json")
BACKUP_DIR = os.path.join(PROJECT_DIR, "backups")

TIERS = ["bachelor", "master", "doctor"]
TIER_LABELS = {"bachelor": "本科", "master": "硕士", "doctor": "博士"}
DIM_KEYS = ["employment", "salary", "degree_threshold", "environment", "prospect", "transfer_diff"]
DIM_LABELS = {
    "employment": "就业难度",
    "salary": "薪资水平",
    "degree_threshold": "学历价值",
    "environment": "工作环境",
    "prospect": "行业前景",
    "transfer_diff": "转行难度",
}
DEFAULT_WEIGHTS = [1, 1, 1, 1, 1, 1]  # 等权重

# ── colorama 降级 ───────────────────────────────────────────────────────────
try:
    from colorama import init, Fore, Style
    init(autoreset=True)
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False

    class FakeFore:
        RED = GREEN = YELLOW = BLUE = CYAN = MAGENTA = WHITE = RESET = ""

    class FakeStyle:
        BRIGHT = DIM = NORMAL = RESET_ALL = ""

    Fore = FakeFore()
    Style = FakeStyle()

# ── 工具函数 ─────────────────────────────────────────────────────────────────

def color(text, fg=Fore.RESET, style=Style.NORMAL):
    """包裹颜色/样式控制码。"""
    return f"{style}{fg}{text}{Style.RESET_ALL}" if HAS_COLOR else text


def print_header(title):
    """打印章节标题。"""
    print()
    print(color("=" * 56, Fore.CYAN))
    print(color(f"  {title}", Fore.CYAN + Style.BRIGHT))
    print(color("=" * 56, Fore.CYAN))


def print_success(msg):
    print(color(f"  [OK] {msg}", Fore.GREEN))


def print_warn(msg):
    print(color(f"  [!!] {msg}", Fore.YELLOW))


def print_error(msg):
    print(color(f"  [ERROR] {msg}", Fore.RED))


def load_data():
    """读取 JSON 数据文件。"""
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print_error(f"数据文件不存在: {DATA_FILE}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print_error(f"JSON 格式错误: {e}")
        sys.exit(1)


def save_data(data):
    """写入 JSON 并做合法性校验。"""
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    # 校验可重新解析
    try:
        json.loads(json_str)
    except json.JSONDecodeError as e:
        print_error(f"写入校验失败，JSON 不合法: {e}")
        return False
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(json_str)
        f.write("\n")
    return True


def backup():
    """备份当前 JSON 到 backups/ 目录，带时间戳。"""
    if not os.path.exists(DATA_FILE):
        print_warn("数据文件不存在，跳过备份")
        return False
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dst = os.path.join(BACKUP_DIR, f"majors_{ts}.json")
    shutil.copy2(DATA_FILE, dst)
    print_success(f"已备份到: {dst}")
    return True


def calc_index(scores, weights=None):
    """计算劝退指数 (0-100)。"""
    if weights is None:
        weights = DEFAULT_WEIGHTS
    dims = DIM_KEYS
    total_w = sum(weights)
    if total_w == 0:
        return 0.0
    return sum(scores[d] * w for d, w in zip(dims, weights)) / total_w


def get_segment(index):
    """根据劝退指数返回对应的分段文本。"""
    data = load_data()
    for seg in sorted(data.get("scoreSegments", []), key=lambda s: s["max"]):
        if index <= seg["max"]:
            return seg
    return data.get("scoreSegments", [{}])[-1]


# ══════════════════════════════════════════════════════════════════════════════
#  功能 1: 查看专业列表
# ══════════════════════════════════════════════════════════════════════════════

def cmd_list():
    """列出所有专业及劝退指数（按默认等权重计算）。"""
    data = load_data()
    print_header("专业劝退指数总览（等权重平均，0-100，越高越劝退）")
    high_count = 0

    for i, major in enumerate(data.get("majors", []), 1):
        # 对该专业所有学历、所有方向的各维度取平均值
        all_scores = {k: [] for k in DIM_KEYS}
        for tier_key in TIERS:
            tier = major.get("tiers", {}).get(tier_key, {})
            for sf_name, sf_data in tier.get("subfields", {}).items():
                for k in DIM_KEYS:
                    all_scores[k].append(sf_data["scores"].get(k, 50))

        avg_scores = {k: (sum(v) / len(v) if v else 50) for k, v in all_scores.items()}
        idx = calc_index(avg_scores)

        seg = get_segment(idx)
        line = f"  [{i:02d}] {major['name']:　<8s}  |  劝退指数: {idx:5.1f}  |  {seg['text']}"
        if idx > 70:
            high_count += 1
            print(color(line, Fore.RED + Style.BRIGHT))
        else:
            print(line)

    print()
    print(f"  共 {len(data.get('majors', []))} 个专业，劝退指数 >70 的: {high_count} 个")


# ══════════════════════════════════════════════════════════════════════════════
#  功能 2: 修改维度分数
# ══════════════════════════════════════════════════════════════════════════════

def _select_major(data):
    """交互式选择专业，返回 major 对象和索引。"""
    majors = data.get("majors", [])
    print()
    for i, m in enumerate(majors, 1):
        print(f"  [{i}] {m['name']} ({m.get('category', '')})")
    print()
    try:
        choice = int(input("  请选择专业序号: ").strip())
        if 1 <= choice <= len(majors):
            return majors[choice - 1], choice - 1
    except ValueError:
        pass
    return None, -1


def _select_tier(major):
    """交互式选择学历层。"""
    tiers = major.get("tiers", {})
    print()
    for key in TIERS:
        t = tiers.get(key, {})
        label = t.get("label", key)
        sf_count = len(t.get("subfields", {}))
        print(f"  [{key[:4]}] {label} ({sf_count} 个方向)")
    print()
    choice = input("  请选择学历 (bachelor/master/doctor): ").strip().lower()
    if choice in TIERS:
        return choice
    return None


def _select_subfield(major, tier_key):
    """交互式选择方向，返回方向名。"""
    tier = major.get("tiers", {}).get(tier_key, {})
    subfields = tier.get("subfields", {})
    names = list(subfields.keys())
    print()
    for i, name in enumerate(names, 1):
        print(f"  [{i}] {name}")
    print()
    try:
        choice = int(input("  请选择方向序号: ").strip())
        if 1 <= choice <= len(names):
            return names[choice - 1]
    except ValueError:
        pass
    return None


def _select_dim():
    """交互式选择维度。"""
    print()
    for i, key in enumerate(DIM_KEYS, 1):
        print(f"  [{i}] {DIM_LABELS[key]} ({key})")
    print()
    try:
        choice = int(input("  请选择维度序号: ").strip())
        if 1 <= choice <= len(DIM_KEYS):
            return DIM_KEYS[choice - 1]
    except ValueError:
        pass
    return None


def cmd_edit_score():
    """交互式修改某个专业/学历/方向的维度分数。"""
    data = load_data()

    # 1. 选专业
    major, major_idx = _select_major(data)
    if major is None:
        print_error("无效选择")
        return

    # 2. 选学历
    tier_key = _select_tier(major)
    if tier_key is None:
        print_error("无效学历")
        return

    # 3. 选方向
    sf_name = _select_subfield(major, tier_key)
    if sf_name is None:
        print_error("无效方向")
        return

    tier = major["tiers"][tier_key]
    sf = tier["subfields"][sf_name]
    scores = sf.setdefault("scores", {})

    # 4. 显示当前分数
    print_header(f"当前 {major['name']} / {tier.get('label', tier_key)} / {sf_name} 的分数")
    for key in DIM_KEYS:
        val = scores.get(key, "未设置")
        print(f"  {DIM_LABELS[key]:　<6s} ({key:>16s}): {val}")

    # 5. 选维度
    dim_key = _select_dim()
    if dim_key is None:
        print_error("无效维度")
        return

    # 6. 输入新分数
    try:
        new_val = int(input(f"\n  请输入 {DIM_LABELS[dim_key]} 的新分数 (0-100): ").strip())
    except ValueError:
        print_error("请输入整数")
        return

    if new_val < 0 or new_val > 100:
        print_error("分数范围 0-100")
        return

    old_val = scores.get(dim_key, "未设置")
    print(f"\n  {DIM_LABELS[dim_key]}: {old_val} → {new_val}")
    cfm = input("  确认修改? [y/N]: ").strip().lower()
    if cfm != "y":
        print_warn("取消修改")
        return

    # 备份 + 写入
    backup()
    scores[dim_key] = new_val
    if save_data(data):
        print_success(f"已更新 {major['name']} / {tier.get('label', tier_key)} / {sf_name} / {DIM_LABELS[dim_key]}")


# ══════════════════════════════════════════════════════════════════════════════
#  功能 3: 修改辣评 roast
# ══════════════════════════════════════════════════════════════════════════════

def cmd_edit_roast():
    """修改某个专业的 roast 文案。"""
    data = load_data()
    major, major_idx = _select_major(data)
    if major is None:
        print_error("无效选择")
        return

    print(f"\n  当前 roast: {major.get('roast', '(无)')}")
    print()
    new_roast = input("  请输入新的 roast 文案: ").strip()
    if not new_roast:
        print_warn("取消修改")
        return

    backup()
    major["roast"] = new_roast
    if save_data(data):
        print_success(f"已更新 {major['name']} 的 roast")


# ══════════════════════════════════════════════════════════════════════════════
#  功能 4: 修改详情 details
# ══════════════════════════════════════════════════════════════════════════════

def cmd_edit_details():
    """修改某个方向的 details 字段。"""
    data = load_data()
    major, major_idx = _select_major(data)
    if major is None:
        print_error("无效选择")
        return

    tier_key = _select_tier(major)
    if tier_key is None:
        print_error("无效学历")
        return

    sf_name = _select_subfield(major, tier_key)
    if sf_name is None:
        print_error("无效方向")
        return

    tier = major["tiers"][tier_key]
    sf = tier["subfields"][sf_name]
    details = sf.setdefault("details", {})

    detail_fields = [
        ("employment_rate", "就业率"),
        ("avg_salary", "平均薪资"),
        ("typical_roles", "典型岗位"),
        ("work_env_desc", "工作环境"),
        ("industry_trend", "行业趋势"),
    ]

    print_header(f"当前详情: {major['name']} / {tier.get('label', tier_key)} / {sf_name}")
    for key, label in detail_fields:
        print(f"  {label}: {details.get(key, '(未设置)')}")

    print()
    for i, (key, label) in enumerate(detail_fields, 1):
        print(f"  [{i}] {label}")
    print()

    try:
        choice = int(input("  请选择要修改的字段序号: ").strip())
        if not (1 <= choice <= len(detail_fields)):
            print_error("无效选择")
            return
    except ValueError:
        print_error("无效输入")
        return

    key, label = detail_fields[choice - 1]
    new_val = input(f"  请输入 {label} 的新内容: ").strip()
    if not new_val:
        print_warn("取消修改")
        return

    backup()
    details[key] = new_val
    if save_data(data):
        print_success(f"已更新 {major['name']} / {tier.get('label', tier_key)} / {sf_name} / {label}")


# ══════════════════════════════════════════════════════════════════════════════
#  功能 5: 新增方向
# ══════════════════════════════════════════════════════════════════════════════

def cmd_add_subfield():
    """为某个专业新增细分方向。"""
    data = load_data()
    major, major_idx = _select_major(data)
    if major is None:
        print_error("无效选择")
        return

    tier_key = _select_tier(major)
    if tier_key is None:
        print_error("无效学历")
        return

    tier = major["tiers"][tier_key]
    subfields = tier.setdefault("subfields", {})

    print()
    new_name = input("  请输入新方向名称: ").strip()
    if not new_name:
        print_warn("取消")
        return
    if new_name in subfields:
        print_error(f"方向 '{new_name}' 已存在")
        return

    print(f"\n  请输入 '{new_name}' 的 6 维分数 (0-100):")
    new_scores = {}
    for key in DIM_KEYS:
        while True:
            try:
                val = int(input(f"    {DIM_LABELS[key]} ({key}): ").strip())
                if 0 <= val <= 100:
                    new_scores[key] = val
                    break
                print("    范围 0-100，请重试")
            except ValueError:
                print("    请输入整数")

    print(f"\n  请输入 '{new_name}' 的详情信息:")
    details = {}
    detail_prompts = [
        ("employment_rate", "就业率"),
        ("avg_salary", "平均薪资"),
        ("typical_roles", "典型岗位"),
        ("work_env_desc", "工作环境"),
        ("industry_trend", "行业趋势"),
    ]
    for key, label in detail_prompts:
        val = input(f"    {label}: ").strip()
        if val:
            details[key] = val

    print_header("确认新增方向")
    print(f"  专业: {major['name']}")
    print(f"  学历: {tier.get('label', tier_key)}")
    print(f"  方向: {new_name}")
    print(f"  分数: {new_scores}")
    print(f"  详情: {details}")
    cfm = input("\n  确认新增? [y/N]: ").strip().lower()
    if cfm != "y":
        print_warn("取消")
        return

    backup()
    subfields[new_name] = {"scores": new_scores, "details": details}
    if save_data(data):
        print_success(f"已新增方向: {major['name']} / {tier.get('label', tier_key)} / {new_name}")


# ══════════════════════════════════════════════════════════════════════════════
#  功能 6: 手动备份
# ══════════════════════════════════════════════════════════════════════════════

def cmd_backup():
    """手动备份。"""
    print_header("手动备份")
    backup()


# ══════════════════════════════════════════════════════════════════════════════
#  主菜单
# ══════════════════════════════════════════════════════════════════════════════

MENU_ITEMS = [
    ("1", "查看",         "列出所有专业及劝退指数（>70 红色高亮）", cmd_list),
    ("2", "修改分数",     "修改某专业/学历/方向的维度分数",       cmd_edit_score),
    ("3", "修改辣评",     "修改某专业的 roast 文案",             cmd_edit_roast),
    ("4", "修改详情",     "修改某方向的 details 信息",           cmd_edit_details),
    ("5", "新增方向",     "为某专业新增一个细分方向",            cmd_add_subfield),
    ("6", "备份",         "备份当前 JSON 到 backups/",          cmd_backup),
    ("0", "退出",         "",                                   None),
]


def show_menu():
    print()
    print(color("╔═══════════════════════════════════════════════════╗", Fore.CYAN))
    print(color("║        天坑劝退计算器 — 数据维护工具              ║", Fore.CYAN + Style.BRIGHT))
    print(color("╠═══════════════════════════════════════════════════╣", Fore.CYAN))
    for key, name, desc, _ in MENU_ITEMS:
        if key == "0":
            print(color("╠═══════════════════════════════════════════════════╣", Fore.CYAN))
        line = f"  [{key}] {name}"
        if desc:
            line += f"  —  {desc}"
        print(color(line, Fore.WHITE))
    print(color("╚═══════════════════════════════════════════════════╝", Fore.CYAN))
    print()


def main():
    # 启动时校验数据文件
    if not os.path.exists(DATA_FILE):
        print_error(f"数据文件不存在: {DATA_FILE}")
        print_error("请确认脚本位于 scripts/ 目录下，且 src/data/majors.json 存在")
        sys.exit(1)

    # 校验 JSON 合法性
    try:
        load_data()
        print_success(f"数据文件加载成功: {DATA_FILE}")
    except Exception as e:
        print_error(f"加载失败: {e}")
        sys.exit(1)

    if not HAS_COLOR:
        print_warn("colorama 未安装，将使用纯文本模式。安装方式: pip install colorama")

    while True:
        show_menu()
        choice = input("  请选择操作: ").strip()

        if choice == "0":
            print()
            print_success("再见，记得备份哦~")
            break

        matched = None
        for key, name, desc, func in MENU_ITEMS:
            if choice == key:
                matched = func
                break

        if matched:
            try:
                matched()
            except KeyboardInterrupt:
                print()
                print_warn("操作已取消")
            except Exception as e:
                print_error(f"执行出错: {e}")
        else:
            print_warn(f"无效选项: {choice}")


if __name__ == "__main__":
    main()