#!/usr/bin/env python3
"""
Script dịch tài liệu JavaGuide từ tiếng Trung sang tiếng Việt.

Cách dùng:
  export ANTHROPIC_API_KEY="sk-ant-..."
  python3 translate_docs.py

Hoặc:
  python3 translate_docs.py --api-key sk-ant-... --section java
  python3 translate_docs.py --resume   # tiếp tục từ chỗ dang dở

Tùy chọn:
  --section SECTION   Chỉ dịch 1 section (java, database, cs-basics, v.v.)
  --file FILE         Chỉ dịch 1 file cụ thể
  --resume            Bỏ qua các file đã có log dịch xong
  --dry-run           Chạy thử, không ghi file
  --api-key KEY       Anthropic API key (ưu tiên hơn env var)
  --model MODEL       Model dùng để dịch (mặc định: claude-haiku-4-5-20251001)
"""

import anthropic
import argparse
import json
import os
import sys
import time
from pathlib import Path

# ──────────────────────────────────────────────
# Cấu hình
# ──────────────────────────────────────────────
DOCS_DIR = Path(__file__).parent / "docs"
LOG_FILE = Path(__file__).parent / "translate_progress.json"
DEFAULT_MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 8192
RETRY_LIMIT = 3
RETRY_DELAY = 5   # giây

TRANSLATE_PROMPT = """\
Bạn là dịch giả kỹ thuật chuyên nghiệp. Hãy dịch nội dung Markdown sau từ tiếng Trung sang tiếng Việt.

QUY TẮC BẮT BUỘC:
1. Giữ nguyên toàn bộ code block (``` ... ``` và `inline code`)
2. Giữ nguyên URL, đường dẫn file, anchor link
3. Giữ nguyên frontmatter YAML (phần giữa --- ở đầu file):
   - Dịch giá trị của: title, description
   - Giữ nguyên: category, tag, các giá trị là thuật ngữ kỹ thuật
4. Giữ nguyên thuật ngữ kỹ thuật tiếng Anh phổ biến:
   Java, Spring, HTTP, TCP, API, REST, JSON, SQL, Redis, MySQL, Git,
   Docker, Kubernetes, Linux, JVM, GC, CPU, RAM, I/O, v.v.
5. Giữ nguyên toàn bộ cú pháp Markdown: #, **, *, [], ![], >, -, 1., |, v.v.
6. Giữ nguyên các thẻ HTML nếu có
7. Giữ nguyên emoji nếu có
8. CHỈ trả về nội dung đã dịch, KHÔNG thêm bất kỳ lời giải thích nào

NỘI DUNG CẦN DỊCH:
{content}"""


# ──────────────────────────────────────────────
# Tiện ích
# ──────────────────────────────────────────────

def load_progress() -> dict:
    if LOG_FILE.exists():
        return json.loads(LOG_FILE.read_text())
    return {"done": [], "failed": []}


def save_progress(progress: dict):
    LOG_FILE.write_text(json.dumps(progress, ensure_ascii=False, indent=2))


def is_chinese(text: str) -> bool:
    """Kiểm tra file có chứa tiếng Trung không."""
    chinese_chars = sum(1 for c in text if '一' <= c <= '鿿')
    return chinese_chars > 20


def get_md_files(section: str = None, single_file: str = None) -> list[Path]:
    if single_file:
        return [Path(single_file)]

    pattern = "**/*.md"
    files = []
    for f in sorted(DOCS_DIR.glob(pattern)):
        # Bỏ qua snippet và vuepress config
        if ".vuepress" in str(f) or f.name.endswith(".snippet.md"):
            continue
        if section and f.parent.parts[len(DOCS_DIR.parts)] != section:
            # Kiểm tra section đầu tiên trong path
            rel = f.relative_to(DOCS_DIR)
            if str(rel).split("/")[0] != section:
                continue
        files.append(f)
    return files


def translate_content(client: anthropic.Anthropic, content: str, model: str) -> str:
    """Gọi API dịch nội dung. Có retry tự động."""
    for attempt in range(RETRY_LIMIT):
        try:
            msg = client.messages.create(
                model=model,
                max_tokens=MAX_TOKENS,
                messages=[{
                    "role": "user",
                    "content": TRANSLATE_PROMPT.format(content=content)
                }]
            )
            return msg.content[0].text
        except anthropic.RateLimitError:
            wait = RETRY_DELAY * (attempt + 1)
            print(f"  ⚠ Rate limit, chờ {wait}s...")
            time.sleep(wait)
        except anthropic.APIError as e:
            if attempt == RETRY_LIMIT - 1:
                raise
            print(f"  ⚠ API lỗi ({e}), thử lại ({attempt+1}/{RETRY_LIMIT})...")
            time.sleep(RETRY_DELAY)
    raise RuntimeError("Vượt quá số lần thử lại")


def translate_large_file(client: anthropic.Anthropic, content: str, model: str) -> str:
    """Dịch file lớn bằng cách chia thành các đoạn theo heading."""
    lines = content.split('\n')
    chunks = []
    current_chunk = []
    current_size = 0
    MAX_CHUNK = 3000  # ký tự

    for line in lines:
        current_chunk.append(line)
        current_size += len(line)
        # Cắt tại heading hoặc khi quá lớn
        if current_size > MAX_CHUNK and (line.startswith('#') or line == ''):
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_size = 0

    if current_chunk:
        chunks.append('\n'.join(current_chunk))

    results = []
    for i, chunk in enumerate(chunks):
        if i > 0:
            time.sleep(0.5)  # Tránh rate limit
        results.append(translate_content(client, chunk, model))

    return '\n'.join(results)


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Dịch JavaGuide docs sang tiếng Việt")
    parser.add_argument("--api-key", help="Anthropic API key")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Model Claude")
    parser.add_argument("--section", help="Chỉ dịch section này")
    parser.add_argument("--file", help="Chỉ dịch file này")
    parser.add_argument("--resume", action="store_true", help="Bỏ qua file đã dịch")
    parser.add_argument("--dry-run", action="store_true", help="Không ghi file")
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ Thiếu ANTHROPIC_API_KEY. Dùng --api-key hoặc export ANTHROPIC_API_KEY=...")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    progress = load_progress() if args.resume else {"done": [], "failed": []}

    files = get_md_files(section=args.section, single_file=args.file)
    total = len(files)
    skipped = 0
    translated = 0
    failed = 0

    print(f"📚 Tìm thấy {total} file cần xử lý")
    if args.dry_run:
        print("🔍 Chế độ dry-run: không ghi file")

    for i, filepath in enumerate(files, 1):
        rel = str(filepath.relative_to(DOCS_DIR))

        # Bỏ qua nếu đã dịch (chế độ resume)
        if args.resume and rel in progress["done"]:
            skipped += 1
            continue

        try:
            content = filepath.read_text(encoding="utf-8")
        except Exception as e:
            print(f"[{i}/{total}] ⚠ Không đọc được {rel}: {e}")
            continue

        # Bỏ qua file không có tiếng Trung
        if not is_chinese(content):
            print(f"[{i}/{total}] ⏭ Bỏ qua (không có tiếng Trung): {rel}")
            skipped += 1
            continue

        print(f"[{i}/{total}] 🔄 Dịch: {rel} ({len(content)} ký tự)")

        try:
            if len(content) > 6000:
                translated_text = translate_large_file(client, content, args.model)
            else:
                translated_text = translate_content(client, content, args.model)

            if not args.dry_run:
                filepath.write_text(translated_text, encoding="utf-8")
                print(f"  ✅ Đã lưu")
            else:
                print(f"  ✅ OK (dry-run)")

            progress["done"].append(rel)
            translated += 1

        except Exception as e:
            print(f"  ❌ Lỗi: {e}")
            progress["failed"].append({"file": rel, "error": str(e)})
            failed += 1

        # Lưu tiến độ sau mỗi file
        if not args.dry_run:
            save_progress(progress)

        # Tránh rate limit
        time.sleep(0.3)

    # Tổng kết
    print(f"\n{'='*50}")
    print(f"✅ Đã dịch:  {translated}")
    print(f"⏭ Bỏ qua:   {skipped}")
    print(f"❌ Lỗi:      {failed}")
    print(f"{'='*50}")

    if progress["failed"]:
        print("\nCác file lỗi:")
        for item in progress["failed"]:
            print(f"  - {item['file']}: {item['error']}")
        print(f"\nChạy lại với --resume để thử lại các file lỗi.")


if __name__ == "__main__":
    main()
