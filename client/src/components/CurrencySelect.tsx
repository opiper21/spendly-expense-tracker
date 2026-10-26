import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useCurrency } from "../context/currencyContext";
import { currencies } from "../lib/currency";

function getSymbol(code: string, locale: string): string {
  const part = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((item) => item.type === "currency");

  return part?.value ?? code;
}

const symbols: Record<string, string> = Object.fromEntries(
  currencies.map((item) => [item.code, getSymbol(item.code, item.locale)])
);

export default function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = Math.max(
    0,
    currencies.findIndex((item) => item.code === currency)
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function openMenu() {
    setHighlighted(selectedIndex);
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(code: string) {
    setCurrency(code);
    closeMenu();
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((index) => (index + 1) % currencies.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((index) => (index - 1 + currencies.length) % currencies.length);
        break;
      case "Home":
        event.preventDefault();
        setHighlighted(0);
        break;
      case "End":
        event.preventDefault();
        setHighlighted(currencies.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(currencies[highlighted].code);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            openMenu();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${currency}`}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface pl-1.5 pr-3 text-sm font-medium transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
      >
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent/10 px-1.5 text-xs font-semibold text-accent">
          {symbols[currency]}
        </span>
        {currency}
        <ChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-label="Currency"
            aria-activedescendant={`currency-${currencies[highlighted].code}`}
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-xl outline-none"
          >
            {currencies.map((item, index) => {
              const selected = item.code === currency;

              return (
                <li
                  key={item.code}
                  id={`currency-${item.code}`}
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(item.code)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                    index === highlighted ? "bg-surface-muted" : ""
                  }`}
                >
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/10 px-1.5 text-xs font-semibold text-accent">
                    {symbols[item.code]}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-xs text-muted">{item.code}</span>
                  </span>
                  {selected && <Check size={16} className="text-accent" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}