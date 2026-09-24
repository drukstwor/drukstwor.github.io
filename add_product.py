"""Add or remove products stored directly in index.html.

Run from the project directory:
    python add_product.py

After a change, the script attempts to commit and push it when this folder
is a Git checkout with a configured remote and credentials.
"""

from __future__ import annotations

import html
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
HTML_FILE = ROOT / "index.html"
IMAGE_DIR = ROOT / "images"


def ask(prompt: str, required: bool = True) -> str:
    while True:
        value = input(prompt).strip()
        if value or not required:
            return value
        print("Ta wartość jest wymagana.")


def safe_filename(path: Path) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", path.name).strip("-")
    return cleaned or "produkt.jpg"


def valid_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def find_git() -> str:
    git = shutil.which("git")
    if git:
        return git

    candidates = [
        Path.home() / "AppData" / "Local" / "Programs" / "Git" / "cmd" / "git.exe",
        Path.home() / "AppData" / "Local" / "github-copilot-git-2.53.0-4" / "cmd" / "git.exe",
        Path("C:/Program Files/Git/cmd/git.exe"),
        Path("C:/Program Files/Git/bin/git.exe"),
        Path("C:/Program Files (x86)/Git/cmd/git.exe"),
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    raise FileNotFoundError("Nie znaleziono programu Git. Zainstaluj Git lub dodaj go do PATH.")


def card_markup(data: dict[str, str]) -> str:
    values = {key: html.escape(value, quote=True) for key, value in data.items()}
    badge = f'<span class="product-badge">{values["label"]}</span>' if values["label"] else ""
    return f"""        <article class="product-card manual-product-card" data-manual="true" data-id="{values["id"]}"
          data-name="{values["name"]}" data-category="{values["category"]}" data-label="{values["label"]}"
          data-price="{values["price"]}" data-description="{values["description"]}"
          data-image="{values["image"]}" data-link="{values["link"]}" tabindex="0">
          <div class="product-image">
            {badge}
            <img src="{values["image"]}" alt="{values["name"]}" class="product-photo">
          </div>
          <div class="product-content">
            <div class="product-head">
              <h3 class="product-name">{values["name"]}</h3>
              <span class="product-price">{values["price"]} zł</span>
            </div>
            <p class="product-description">{values["description"]}</p>
            <div class="product-footer">
              <span class="product-category">{values["category"]}</span>
              <a class="buy-link" href="{values["link"]}" target="_blank" rel="noopener noreferrer">KUP NA ALLEGRO</a>
            </div>
          </div>
        </article>
"""


def run_git(
    *args: str, check: bool = False, credential_manager: bool = False
) -> subprocess.CompletedProcess[str]:
    git = find_git()
    command = [git]
    if credential_manager:
        command.extend(["-c", "credential.helper=manager"])
    command.extend(args)
    return subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=check,
    )


def sync_repository(action: str) -> None:
    try:
        check = run_git("rev-parse", "--is-inside-work-tree")
    except FileNotFoundError as error:
        print(f"\nProdukt zapisano lokalnie, ale nie można wykonać synchronizacji: {error}")
        return
    if check.returncode != 0:
        print("\nZmiany zapisano lokalnie. Ten folder nie jest klonem GitHub repozytorium.")
        print("Aby włączać automatyczny push, uruchom skrypt w sklonowanym repozytorium.")
        return

    remote = run_git("remote", "get-url", "origin")
    if remote.returncode != 0:
        print("\nZmiany zapisano lokalnie. Repozytorium nie ma remote 'origin'.")
        return

    message = f"Update product catalog: {action}"
    staged = run_git("add", "index.html", "add_product.py", "script.js", "styles.css", "images")
    if staged.returncode != 0:
        print(f"\nNie udało się przygotować zmian Git: {staged.stderr.strip()}")
        return

    committed = run_git("commit", "-m", message)
    if committed.returncode != 0:
        print(f"\nNie udało się utworzyć commita: {committed.stderr.strip()}")
        return

    pushed = run_git("push", credential_manager=True)
    if pushed.returncode == 0:
        print("Zmiany zostały zapisane, zacommitowane i wysłane do GitHub.")
    else:
        print("\nZmiany zapisano i zacommitowano lokalnie, ale push nie powiódł się.")
        print(pushed.stderr.strip())


def add_product() -> None:
    print("Dodawanie produktu do index.html\n")
    name = ask("Nazwa produktu: ")
    description = ask("Opis produktu: ")
    price = ask("Cena (np. 89,99): ")
    category = ask("Sekcja (halloween/gadzety): ").lower()
    if category not in {"halloween", "gadzety"}:
        raise SystemExit("Sekcja musi mieć wartość: halloween albo gadzety.")
    label = ask("Etykieta (opcjonalnie): ", required=False)
    allegro_link = ask("Link do oferty Allegro: ")
    if not valid_url(allegro_link):
        raise SystemExit("Link musi zaczynać się od http:// albo https://.")
    source_image = Path(ask("Ścieżka do zdjęcia produktu: ")).expanduser()
    if not source_image.is_file():
        raise SystemExit(f"Nie znaleziono pliku zdjęcia: {source_image}")

    content = HTML_FILE.read_text(encoding="utf-8")
    section_name = "HALLOWEEN" if category == "halloween" else "GADGETS"
    marker = f"<!-- PRODUCTS_{section_name}_END -->"
    if marker not in content:
        raise SystemExit(f"Nie znaleziono znacznika sekcji w {HTML_FILE.name}.")

    IMAGE_DIR.mkdir(exist_ok=True)
    filename = safe_filename(source_image)
    destination = IMAGE_DIR / filename
    shutil.copy2(source_image, destination)

    existing_ids = [int(value) for value in re.findall(r'data-id="manual-(\d+)"', content)]
    product_id = f"manual-{max(existing_ids, default=0) + 1}"
    data = {
        "id": product_id,
        "name": name,
        "description": description,
        "price": price,
        "category": "Halloween" if category == "halloween" else "Gadżety",
        "label": label,
        "image": f"images/{filename}",
        "link": allegro_link,
    }
    content = content.replace(marker, card_markup(data) + f"        {marker}", 1)
    HTML_FILE.write_text(content, encoding="utf-8")
    print(f"\nDodano produkt {product_id} do {HTML_FILE.name}.")
    print(f"Zdjęcie skopiowano do {destination}.")
    sync_repository(f"add {product_id}")


def list_manual_products(content: str) -> list[tuple[str, str]]:
    cards = re.findall(
        r'<article\b[^>]*class="[^"]*\bmanual-product-card\b[^"]*"[^>]*>.*?</article>',
        content,
        re.DOTALL,
    )
    result = []
    for card in cards:
        product_id = re.search(r'\bdata-id="([^"]+)"', card)
        name = re.search(r'\bdata-name="([^"]*)"', card)
        if product_id and name:
            result.append((product_id.group(1), html.unescape(name.group(1))))
    return result


def remove_product() -> None:
    content = HTML_FILE.read_text(encoding="utf-8")
    products = list_manual_products(content)
    if not products:
        raise SystemExit("Nie ma produktów dodanych przez ten program.")

    print("Produkty możliwe do usunięcia:")
    for product_id, name in products:
        print(f"- {product_id}: {html.unescape(name)}")
    selected = ask("Podaj ID produktu do usunięcia: ")
    if not any(product_id == selected for product_id, _ in products):
        raise SystemExit("Nie znaleziono produktu o takim ID.")

    pattern = re.compile(
        rf'\s*<article\b[^>]*class="[^"]*\bmanual-product-card\b[^"]*"[^>]*data-id="{re.escape(selected)}"[^>]*>.*?</article>\s*',
        re.DOTALL,
    )
    if not pattern.search(content):
        pattern = re.compile(
            rf'\s*<article\b(?=[^>]*\bmanual-product-card\b)(?=[^>]*\bdata-id="{re.escape(selected)}")[^>]*>.*?</article>\s*',
            re.DOTALL,
        )
    match = pattern.search(content)
    if not match:
        raise SystemExit("Nie udało się odnaleźć karty produktu w index.html.")

    image_match = re.search(r'data-image="([^"]+)"', match.group(0))
    content = content[:match.start()] + content[match.end():]
    HTML_FILE.write_text(content, encoding="utf-8")

    if image_match:
        image_file = ROOT / image_match.group(1).replace("/", "\\")
        if image_file.is_file() and str(image_file).startswith(str(IMAGE_DIR)):
            image_file.unlink()

    print(f"\nUsunięto produkt {selected} z {HTML_FILE.name}.")
    sync_repository(f"remove {selected}")


def main() -> None:
    interactive = len(sys.argv) == 1
    try:
        action = sys.argv[1].lower() if not interactive else ask("Wybierz działanie (dodaj/usun): ").lower()
        if action in {"dodaj", "add"}:
            add_product()
        elif action in {"usun", "usuń", "remove", "delete"}:
            remove_product()
        else:
            raise SystemExit("Użyj: dodaj albo usun.")
    except (SystemExit, OSError, ValueError) as error:
        print(f"\nNie wykonano operacji: {error}")
    finally:
        if interactive:
            input("\nNaciśnij Enter, aby zamknąć okno...")


if __name__ == "__main__":
    main()
