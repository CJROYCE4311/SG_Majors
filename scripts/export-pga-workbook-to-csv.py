#!/usr/bin/env python3
"""Export PGA control workbook input sheets to canonical CSV files.

This intentionally uses only Python's standard library so the night-of workflow
does not depend on a local Excel parsing package.
"""

from __future__ import annotations

import csv
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[1]
PGA_DIR = REPO_ROOT / "PGA_Championship"
DEFAULT_WORKBOOK = PGA_DIR / "pga_championship_control.xlsx"

SHEET_EXPORTS = {
    "Players": PGA_DIR / "pga_championship_players.csv",
    "Teams": PGA_DIR / "pga_championship_teams.csv",
    "Team Scores": PGA_DIR / "pga_championship_scores.csv",
    "Pro Picks": PGA_DIR / "pga_championship_pro_picks.csv",
    "Pro Scores": PGA_DIR / "pga_championship_pro_scores.csv",
    "Calcutta": PGA_DIR / "pga_championship_calcutta_board.csv",
    "Payouts": PGA_DIR / "pga_championship_payouts.csv",
}

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def main() -> int:
    workbook_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_WORKBOOK
    if not workbook_path.exists():
        print(f"Workbook not found: {workbook_path}", file=sys.stderr)
        return 1

    with zipfile.ZipFile(workbook_path) as package:
        shared_strings = read_shared_strings(package)
        sheet_paths = workbook_sheet_paths(package)
        missing = [sheet for sheet in SHEET_EXPORTS if sheet not in sheet_paths]
        if missing:
            print(f"Workbook is missing required sheet(s): {', '.join(missing)}", file=sys.stderr)
            return 1

        for sheet_name, output_path in SHEET_EXPORTS.items():
            rows = read_sheet(package, sheet_paths[sheet_name], shared_strings)
            if not rows:
                print(f"{sheet_name} is empty.", file=sys.stderr)
                return 1
            rows = format_rows_for_csv(sheet_name, trim_empty_rows(rows))
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with output_path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.writer(handle, lineterminator="\n")
                writer.writerows(rows)
            print(f"Wrote {output_path.relative_to(REPO_ROOT)}")

    return 0


def read_shared_strings(package: zipfile.ZipFile) -> list[str]:
    try:
        xml = package.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(xml)
    strings: list[str] = []
    for item in root.findall("main:si", NS):
        text_parts = [node.text or "" for node in item.findall(".//main:t", NS)]
        strings.append("".join(text_parts))
    return strings


def workbook_sheet_paths(package: zipfile.ZipFile) -> dict[str, str]:
    workbook = ET.fromstring(package.read("xl/workbook.xml"))
    rels = ET.fromstring(package.read("xl/_rels/workbook.xml.rels"))
    rel_targets = {}
    for rel in rels.findall("pkgrel:Relationship", NS):
        rel_id = rel.attrib["Id"]
        target = rel.attrib["Target"]
        normalized_target = target.lstrip("/")
        rel_targets[rel_id] = normalized_target if normalized_target.startswith("xl/") else f"xl/{normalized_target}"

    paths = {}
    for sheet in workbook.findall("main:sheets/main:sheet", NS):
        sheet_name = sheet.attrib["name"]
        rel_id = sheet.attrib[f"{{{NS['rel']}}}id"]
        paths[sheet_name] = rel_targets[rel_id]
    return paths


def read_sheet(package: zipfile.ZipFile, path: str, shared_strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(package.read(path))
    cells_by_row: dict[int, dict[int, str]] = {}
    max_col = 0

    for row in root.findall(".//main:sheetData/main:row", NS):
        row_index = int(row.attrib["r"])
        cells_by_row.setdefault(row_index, {})
        for cell in row.findall("main:c", NS):
            ref = cell.attrib.get("r", "")
            column_index = column_number(ref)
            max_col = max(max_col, column_index)
            cells_by_row[row_index][column_index] = cell_value(cell, shared_strings)

    if not cells_by_row:
        return []

    max_row = max(cells_by_row)
    rows: list[list[str]] = []
    for row_index in range(1, max_row + 1):
        row_values = []
        for column_index in range(1, max_col + 1):
            row_values.append(cells_by_row.get(row_index, {}).get(column_index, ""))
        rows.append(row_values)
    return rows


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t", "")
    if cell_type == "inlineStr":
        return "".join(node.text or "" for node in cell.findall(".//main:t", NS)).strip()

    value_node = cell.find("main:v", NS)
    if value_node is None or value_node.text is None:
        return ""

    value = value_node.text
    if cell_type == "s":
        index = int(value)
        return shared_strings[index].strip() if index < len(shared_strings) else ""
    return value.strip()


def trim_empty_rows(rows: list[list[str]]) -> list[list[str]]:
    if not rows:
        return rows
    header, *body = rows
    trimmed_body = [row for row in body if any(cell.strip() for cell in row)]
    width = len(header)
    return [header] + [row[:width] + [""] * max(0, width - len(row)) for row in trimmed_body]


def format_rows_for_csv(sheet_name: str, rows: list[list[str]]) -> list[list[str]]:
    if sheet_name != "Payouts" or len(rows) <= 1:
        return rows
    formatted = [rows[0]]
    for row in rows[1:]:
        next_row = list(row)
        if len(next_row) >= 3:
            try:
                value = float(next_row[2])
            except ValueError:
                value = None
            if value is not None and 0 <= value <= 1:
                next_row[2] = f"{value * 100:g}%"
        formatted.append(next_row)
    return formatted


def column_number(cell_ref: str) -> int:
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    number = 0
    for letter in letters:
        number = number * 26 + ord(letter) - 64
    return number


if __name__ == "__main__":
    raise SystemExit(main())
