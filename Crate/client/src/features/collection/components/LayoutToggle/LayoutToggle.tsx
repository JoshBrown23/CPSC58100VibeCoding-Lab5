import type { ViewMode } from "../../types";
import "./LayoutToggle.css";

interface LayoutToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEWS: { value: ViewMode; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
];

/**
 * LayoutToggle
 * Fully controlled, like SortControl — holds no state of its own.
 * Purely a presentation switch; CollectionPage decides what each
 * view actually renders.
 */
export default function LayoutToggle({ view, onChange }: LayoutToggleProps) {
  return (
    <div className="layout-toggle" role="group" aria-label="Layout">
      {VIEWS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={
            option.value === view
              ? "layout-toggle__option layout-toggle__option--active"
              : "layout-toggle__option"
          }
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === view}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
