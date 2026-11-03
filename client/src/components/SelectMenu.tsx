import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  align?: "left" | "right";
}

export default function SelectMenu({
  label,
  value,
  options,
  onChange,
  icon,
  align = "left",
}: SelectMenuProps) {
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const selected = options[selectedIndex];

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

  function choose(next: string) {
    onChange(next);
    closeMenu();
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((index) => (index + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((index) => (index - 1 + options.length) % options.length);
        break;
      case "Home":
        event.preventDefault();
        setHighlighted(0);
        break;
      case "End":
        event.preventDefault();
        setHighlighted(options.length - 1);
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = options[highlighted];
        if (option) choose(option.value);
        break;
      }
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
    <div ref={containerRef} className="relative min-w-0">
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
        aria-label={`${label}: ${selected?.label ?? ""}`}
        className="flex h-9 max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
      >
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${baseId}-${highlighted}`}
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: align === "right" ? "top right" : "top left" }}
            className={`absolute top-full z-40 mt-2 max-h-64 w-56 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-xl outline-none ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <li
                  key={option.value}
                  id={`${baseId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option.value)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                    index === highlighted ? "bg-surface-muted" : ""
                  }`}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && <Check size={16} className="shrink-0 text-accent" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}