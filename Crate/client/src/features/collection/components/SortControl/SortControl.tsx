import type { SortDirection, SortField } from "../../types";
import "./SortControl.css";

interface SortControlProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onFieldChange: (field: SortField) => void;
  onToggleDirection: () => void;
}

const FIELDS: { value: SortField; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "artist", label: "Artist" },
  { value: "year", label: "Year" },
  { value: "format", label: "Format" },
];

/**
 * SortControl
 * Fully controlled — holds no state of its own. Reusable for any
 * sortable list, not just the album grid.
 */
export default function SortControl({
  sortField,
  sortDirection,
  onFieldChange,
  onToggleDirection,
}: SortControlProps) {
  return (
    <div className="sort-control">
      <span className="sort-control__label">Sort by</span>

      <div className="sort-control__fields" role="group" aria-label="Sort by">
        {FIELDS.map((field) => (
          <button
            key={field.value}
            type="button"
            className={
              field.value === sortField
                ? "sort-control__field sort-control__field--active"
                : "sort-control__field"
            }
            onClick={() => onFieldChange(field.value)}
            aria-pressed={field.value === sortField}
          >
            {field.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="sort-control__direction"
        onClick={onToggleDirection}
        aria-label={sortDirection === "asc" ? "Sort descending" : "Sort ascending"}
      >
        {sortDirection === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}
