"""Graphical product manager for the DrukStwór catalogue."""

from __future__ import annotations

import html
import re
import shutil
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

import add_product as catalog


class ProductManager(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("DrukStwór — Menedżer produktów")
        self.geometry("1060x720")
        self.minsize(900, 620)
        self.configure(bg="#0b0908")
        self.selected_image: Path | None = None
        self.image_preview: tk.PhotoImage | None = None
        self._build_style()
        self._build_ui()
        self.refresh_products()

    def _build_style(self) -> None:
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TFrame", background="#0b0908")
        style.configure("Panel.TFrame", background="#12100f")
        style.configure("TLabel", background="#12100f", foreground="#ffffff", font=("Segoe UI", 10))
        style.configure("Title.TLabel", background="#0b0908", foreground="#ff7900", font=("Segoe UI", 20, "bold"))
        style.configure("Hint.TLabel", background="#12100f", foreground="#b8aea6", font=("Segoe UI", 9))
        style.configure("TEntry", fieldbackground="#1c1815", foreground="#ffffff")
        style.configure("TCombobox", fieldbackground="#1c1815", foreground="#ffffff")
        style.configure("Accent.TButton", background="#ff7900", foreground="#0b0908", font=("Segoe UI", 10, "bold"))
        style.map("Accent.TButton", background=[("active", "#ff941f")])
        style.configure("Danger.TButton", background="#5b2118", foreground="#ffffff")
        style.configure("Treeview", background="#181411", fieldbackground="#181411", foreground="#ffffff", rowheight=30)
        style.configure("Treeview.Heading", background="#2a201a", foreground="#ffb15c", font=("Segoe UI", 9, "bold"))

    def _build_ui(self) -> None:
        header = ttk.Frame(self)
        header.pack(fill="x", padx=24, pady=(20, 12))
        ttk.Label(header, text="Menedżer produktów", style="Title.TLabel").pack(side="left")
        ttk.Label(header, text="DrukStwór.pl · zapis do index.html", style="Hint.TLabel").pack(side="left", padx=18, pady=7)

        body = ttk.Frame(self)
        body.pack(fill="both", expand=True, padx=24, pady=(0, 20))
        body.columnconfigure(0, weight=1)
        body.columnconfigure(1, weight=2)
        body.rowconfigure(0, weight=1)

        form = ttk.Frame(body, style="Panel.TFrame", padding=20)
        form.grid(row=0, column=0, sticky="nsew", padx=(0, 12))
        form.columnconfigure(1, weight=1)
        ttk.Label(form, text="Dodaj produkt", style="Title.TLabel").grid(row=0, column=0, columnspan=2, sticky="w", pady=(0, 16))

        self.name = tk.StringVar()
        self.description = tk.StringVar()
        self.price = tk.StringVar()
        self.category = tk.StringVar(value="halloween")
        self.label = tk.StringVar()
        self.allegro = tk.StringVar()
        self.image_path = tk.StringVar(value="Nie wybrano zdjęcia")

        fields = [
            ("Nazwa", self.name),
            ("Opis", self.description),
            ("Cena", self.price),
            ("Link Allegro", self.allegro),
            ("Etykieta", self.label),
        ]
        for row, (label, variable) in enumerate(fields, start=1):
            ttk.Label(form, text=label).grid(row=row, column=0, sticky="w", pady=7, padx=(0, 10))
            ttk.Entry(form, textvariable=variable).grid(row=row, column=1, sticky="ew", pady=7)

        ttk.Label(form, text="Sekcja").grid(row=6, column=0, sticky="w", pady=7)
        ttk.Combobox(form, textvariable=self.category, values=("halloween", "gadzety"), state="readonly").grid(row=6, column=1, sticky="ew", pady=7)
        ttk.Label(form, text="Zdjęcie").grid(row=7, column=0, sticky="nw", pady=7)
        image_row = ttk.Frame(form, style="Panel.TFrame")
        image_row.grid(row=7, column=1, sticky="ew", pady=7)
        image_row.columnconfigure(0, weight=1)
        ttk.Label(image_row, textvariable=self.image_path, style="Hint.TLabel").grid(row=0, column=0, sticky="w")
        ttk.Button(image_row, text="Wybierz…", command=self.choose_image).grid(row=0, column=1, padx=(8, 0))

        self.preview = ttk.Label(form, text="Podgląd zdjęcia", anchor="center", style="Hint.TLabel")
        self.preview.grid(row=8, column=0, columnspan=2, sticky="ew", pady=18)
        ttk.Button(form, text="DODAJ PRODUKT", style="Accent.TButton", command=self.add).grid(row=9, column=0, columnspan=2, sticky="ew", pady=(8, 0), ipady=7)

        catalog_panel = ttk.Frame(body, style="Panel.TFrame", padding=20)
        catalog_panel.grid(row=0, column=1, sticky="nsew")
        catalog_panel.columnconfigure(0, weight=1)
        catalog_panel.rowconfigure(2, weight=1)
        ttk.Label(catalog_panel, text="Produkty dodane ręcznie", style="Title.TLabel").grid(row=0, column=0, sticky="w")
        ttk.Label(catalog_panel, text="Zaznacz produkt, aby usunąć go z index.html i folderu images.", style="Hint.TLabel").grid(row=1, column=0, sticky="w", pady=(5, 12))

        columns = ("id", "name", "category", "price")
        self.tree = ttk.Treeview(catalog_panel, columns=columns, show="headings", selectmode="browse")
        for column, title, width in (("id", "ID", 100), ("name", "Nazwa", 230), ("category", "Sekcja", 120), ("price", "Cena", 90)):
            self.tree.heading(column, text=title)
            self.tree.column(column, width=width, anchor="w")
        self.tree.grid(row=2, column=0, sticky="nsew")
        scrollbar = ttk.Scrollbar(catalog_panel, orient="vertical", command=self.tree.yview)
        scrollbar.grid(row=2, column=1, sticky="ns")
        self.tree.configure(yscrollcommand=scrollbar.set)

        actions = ttk.Frame(catalog_panel, style="Panel.TFrame")
        actions.grid(row=3, column=0, sticky="ew", pady=(14, 0))
        ttk.Button(actions, text="ODŚWIEŻ LISTĘ", command=self.refresh_products).pack(side="left")
        ttk.Button(actions, text="USUŃ ZAZNACZONY", style="Danger.TButton", command=self.remove_selected).pack(side="right")
        self.status = tk.StringVar(value="Gotowe.")
        ttk.Label(self, textvariable=self.status, style="Hint.TLabel", anchor="w").pack(fill="x", padx=24, pady=(0, 12))

    def choose_image(self) -> None:
        path = filedialog.askopenfilename(
            title="Wybierz zdjęcie produktu",
            filetypes=[("Obrazy", "*.png *.jpg *.jpeg *.webp *.gif"), ("Wszystkie pliki", "*.*")],
        )
        if not path:
            return
        self.selected_image = Path(path)
        self.image_path.set(self.selected_image.name)
        try:
            self.image_preview = tk.PhotoImage(file=str(self.selected_image))
            self.image_preview = self.image_preview.subsample(max(1, self.image_preview.width() // 220), max(1, self.image_preview.height() // 140))
            self.preview.configure(image=self.image_preview, text="")
        except tk.TclError:
            self.preview.configure(image="", text=f"Wybrane zdjęcie:\n{self.selected_image.name}")

    def validate(self) -> bool:
        required = ((self.name, "Nazwa"), (self.description, "Opis"), (self.price, "Cena"), (self.allegro, "Link Allegro"))
        missing = [label for value, label in required if not value.get().strip()]
        if missing:
            messagebox.showwarning("Brak danych", "Uzupełnij: " + ", ".join(missing))
            return False
        if not catalog.valid_url(self.allegro.get().strip()):
            messagebox.showwarning("Nieprawidłowy link", "Link Allegro musi zaczynać się od http:// albo https://.")
            return False
        if not self.selected_image or not self.selected_image.is_file():
            messagebox.showwarning("Brak zdjęcia", "Wybierz zdjęcie produktu.")
            return False
        return True

    def add(self) -> None:
        if not self.validate():
            return
        content = catalog.HTML_FILE.read_text(encoding="utf-8")
        section = "HALLOWEEN" if self.category.get() == "halloween" else "GADGETS"
        marker = f"<!-- PRODUCTS_{section}_END -->"
        if marker not in content:
            messagebox.showerror("Błąd", f"Nie znaleziono znacznika sekcji {section}.")
            return
        catalog.IMAGE_DIR.mkdir(exist_ok=True)
        filename = catalog.safe_filename(self.selected_image)
        destination = catalog.IMAGE_DIR / filename
        shutil.copy2(self.selected_image, destination)
        ids = [int(value) for value in re.findall(r'data-id="manual-(\d+)"', content)]
        product_id = f"manual-{max(ids, default=0) + 1}"
        data = {
            "id": product_id,
            "name": self.name.get().strip(),
            "description": self.description.get().strip(),
            "price": self.price.get().strip(),
            "category": "Halloween" if section == "HALLOWEEN" else "Gadżety",
            "label": self.label.get().strip(),
            "image": f"images/{filename}",
            "link": self.allegro.get().strip(),
        }
        updated = content.replace(marker, catalog.card_markup(data) + f"        {marker}", 1)
        catalog.HTML_FILE.write_text(updated, encoding="utf-8")
        catalog.sync_repository(f"add {product_id}")
        self.status.set(f"Dodano {product_id}.")
        self._clear_form()
        self.refresh_products()

    def refresh_products(self) -> None:
        for item in self.tree.get_children():
            self.tree.delete(item)
        content = catalog.HTML_FILE.read_text(encoding="utf-8")
        for product_id, name in catalog.list_manual_products(content):
            card = re.search(rf'<article\b(?=[^>]*\bdata-id="{re.escape(product_id)}")[^>]*>.*?</article>', content, re.DOTALL)
            category = "—"
            price = "—"
            if card:
                category_match = re.search(r'data-category="([^"]+)"', card.group(0))
                price_match = re.search(r'data-price="([^"]+)"', card.group(0))
                category = category_match.group(1) if category_match else category
                price = price_match.group(1) if price_match else price
            self.tree.insert("", "end", iid=product_id, values=(product_id, name, category, price))

    def remove_selected(self) -> None:
        selection = self.tree.selection()
        if not selection:
            messagebox.showinfo("Wybierz produkt", "Zaznacz produkt na liście.")
            return
        product_id = selection[0]
        if not messagebox.askyesno("Potwierdź usunięcie", f"Usunąć produkt {product_id}?"):
            return
        content = catalog.HTML_FILE.read_text(encoding="utf-8")
        pattern = re.compile(
            rf'\s*<article\b(?=[^>]*\bmanual-product-card\b)(?=[^>]*\bdata-id="{re.escape(product_id)}")[^>]*>.*?</article>\s*',
            re.DOTALL,
        )
        match = pattern.search(content)
        if not match:
            messagebox.showerror("Błąd", "Nie znaleziono karty produktu w index.html.")
            return
        image = re.search(r'data-image="([^"]+)"', match.group(0))
        catalog.HTML_FILE.write_text(content[:match.start()] + content[match.end():], encoding="utf-8")
        if image:
            image_file = catalog.ROOT / image.group(1).replace("/", "\\")
            if image_file.is_file() and str(image_file).startswith(str(catalog.IMAGE_DIR)):
                image_file.unlink()
        catalog.sync_repository(f"remove {product_id}")
        self.status.set(f"Usunięto {product_id}.")
        self.refresh_products()

    def _clear_form(self) -> None:
        for variable in (self.name, self.description, self.price, self.label, self.allegro):
            variable.set("")
        self.selected_image = None
        self.image_path.set("Nie wybrano zdjęcia")
        self.preview.configure(image="", text="Podgląd zdjęcia")
        self.image_preview = None


if __name__ == "__main__":
    ProductManager().mainloop()
