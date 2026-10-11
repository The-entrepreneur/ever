import React, { useState } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal, 
  Layers, 
  Maximize2, 
  Minimize2,
  Inbox
} from "lucide-react";

export type TableDensity = "compact" | "default" | "comfortable";

export interface StandardTableColumn<T> {
  key: string;
  header: string | React.ReactNode;
  align?: "left" | "right" | "center";
  /** If true, aligns text right, enables tabular lining figures, and disables truncation */
  isNumeric?: boolean;
  /** If true, pins column to the left with sticky positioning and hairline shadow divider */
  isSticky?: boolean;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  /** Optional custom cell renderer */
  render?: (row: T, index: number) => React.ReactNode;
  /** Optional raw value getter for automatic empty-state detection */
  getValue?: (row: T) => any;
}

export interface StandardTableProps<T> {
  data: T[];
  columns: StandardTableColumn<T>[];
  keyField: keyof T | ((row: T) => string);
  density?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  showDensityToggle?: boolean;
  sortKey?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  renderRowActions?: (row: T) => React.ReactNode;
  emptyMessage?: string | React.ReactNode;
  isLoading?: boolean;
  className?: string;
  /** Enable zebra stripes on wide 12+ column tables only */
  zebra?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
}

/**
 * Standardized Table Component implementing "A Table Is Six Decisions":
 * 1. Align: Numbers right + tabular lining figures; text left.
 * 2. Rows: Single hairline separator, hover lights the entire row, no zebra by default.
 * 3. Density: 3 modes with 1 toggle (Compact 40px, Default 48px, Comfortable 56px).
 * 4. Sticky: Identity column pinned left, header pinned top.
 * 5. Cells: Empty cells render '—', long text truncates with tooltip, numbers never truncate.
 * 6. Actions: Revealed on hover/focus on desktop; kebab on touch; sort arrow only on active column.
 */
export function StandardTable<T>({
  data,
  columns,
  keyField,
  density: controlledDensity,
  onDensityChange,
  showDensityToggle = true,
  sortKey,
  sortDirection = "desc",
  onSort,
  onRowClick,
  renderRowActions,
  emptyMessage,
  isLoading = false,
  className = "",
  zebra = false,
  stickyHeader = true,
  maxHeight = "100%",
}: StandardTableProps<T>) {
  const [internalDensity, setInternalDensity] = useState<TableDensity>("default");
  const density = controlledDensity ?? internalDensity;

  const handleDensityToggle = (newDensity: TableDensity) => {
    if (onDensityChange) {
      onDensityChange(newDensity);
    } else {
      setInternalDensity(newDensity);
    }
  };

  // Row height specifications from design system
  const densityRowClass = {
    compact: "h-10 py-1.5 text-xs",
    default: "h-12 py-2.5 text-xs",
    comfortable: "h-14 py-3.5 text-sm",
  }[density];

  const getRowKey = (row: T, index: number): string => {
    if (typeof keyField === "function") return keyField(row);
    return String(row[keyField] ?? index);
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 overflow-hidden ${className}`}>
      {/* Top Controls Bar (if density toggle requested) */}
      {showDensityToggle && (
        <div className="flex items-center justify-end pb-2 px-1 gap-2">
          <div className="inline-flex items-center bg-dash-canvas border border-dash-border rounded-lg p-0.5 shadow-sm text-xs">
            <button
              type="button"
              onClick={() => handleDensityToggle("compact")}
              title="Compact density (40px) - Ops & data-dense work"
              className={`px-2 py-1 rounded font-medium transition-all ${
                density === "compact"
                  ? "bg-dash-surface text-dash-text shadow-xs font-semibold"
                  : "text-dash-text-muted hover:text-dash-text"
              }`}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => handleDensityToggle("default")}
              title="Default density (48px) - Everyday balance"
              className={`px-2 py-1 rounded font-medium transition-all ${
                density === "default"
                  ? "bg-dash-surface text-dash-text shadow-xs font-semibold"
                  : "text-dash-text-muted hover:text-dash-text"
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => handleDensityToggle("comfortable")}
              title="Comfortable density (56px) - Review & reading"
              className={`px-2 py-1 rounded font-medium transition-all ${
                density === "comfortable"
                  ? "bg-dash-surface text-dash-text shadow-xs font-semibold"
                  : "text-dash-text-muted hover:text-dash-text"
              }`}
            >
              Comfortable
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div 
        className="overflow-auto relative border border-dash-border rounded-xl bg-dash-surface shadow-xs flex-1"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse text-left">
          {/* Header Row */}
          <thead className={stickyHeader ? "sticky top-0 z-20 bg-dash-surface/95 backdrop-blur-sm" : ""}>
            <tr className="border-b border-dash-border text-dash-text-muted font-medium text-[11px] uppercase tracking-wider select-none">
              {columns.map((col) => {
                const isNumeric = col.isNumeric || col.align === "right";
                const isCenter = col.align === "center";
                const isSorted = sortKey === col.key;

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: col.minWidth }}
                    className={`px-3.5 py-3 ${
                      isNumeric ? "text-right" : isCenter ? "text-center" : "text-left"
                    } ${
                      col.isSticky 
                        ? "sticky left-0 z-30 bg-dash-surface shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" 
                        : ""
                    } ${col.sortable ? "cursor-pointer hover:text-dash-text transition-colors" : ""}`}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${isNumeric ? "justify-end w-full" : ""}`}>
                      <span>{col.header}</span>
                      {/* Sort arrow only on active column */}
                      {col.sortable && isSorted && (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-[#EA6639] shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-[#EA6639] shrink-0" />
                        )
                      )}
                    </div>
                  </th>
                );
              })}
              {renderRowActions && (
                <th className="px-3.5 py-3 text-right w-16 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-dash-border-hairline text-dash-text">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="p-12 text-center text-dash-text-sec">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#EA6639] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-medium">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="p-12 text-center text-dash-text-sec">
                  {emptyMessage || (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-dash-canvas border border-dash-border flex items-center justify-center text-dash-text-muted">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-dash-text">No records found</span>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = getRowKey(row, index);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    className={`group transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${
                      zebra && index % 2 === 1 ? "bg-dash-canvas/30" : "bg-dash-surface"
                    } hover:bg-dash-surface-hover/80 focus-within:bg-dash-surface-hover/80`}
                  >
                    {columns.map((col) => {
                      const isNumeric = col.isNumeric || col.align === "right";
                      const isCenter = col.align === "center";

                      // Value extraction & empty check
                      let cellContent: React.ReactNode;
                      if (col.render) {
                        cellContent = col.render(row, index);
                      } else {
                        const rawVal = col.getValue 
                          ? col.getValue(row) 
                          : (row as any)[col.key];
                        
                        if (rawVal === null || rawVal === undefined || rawVal === "") {
                          cellContent = <span className="text-dash-text-muted select-none">—</span>;
                        } else {
                          cellContent = String(rawVal);
                        }
                      }

                      return (
                        <td
                          key={col.key}
                          style={{ width: col.width, minWidth: col.minWidth }}
                          className={`px-3.5 ${densityRowClass} ${
                            isNumeric 
                              ? "text-right font-mono tabular-nums whitespace-nowrap" 
                              : isCenter 
                              ? "text-center" 
                              : "text-left"
                          } ${
                            col.isSticky 
                              ? "sticky left-0 z-10 bg-dash-surface group-hover:bg-dash-surface-hover/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]" 
                              : ""
                          }`}
                        >
                          {/* Long text truncates with tooltip; numbers never truncate */}
                          {isNumeric ? (
                            <div className="tabular-nums font-mono">{cellContent}</div>
                          ) : typeof cellContent === "string" ? (
                            <div className="truncate max-w-xs" title={cellContent}>
                              {cellContent}
                            </div>
                          ) : (
                            cellContent
                          )}
                        </td>
                      );
                    })}

                    {/* Actions Column (Revealed on hover/focus on desktop; kebab for touch) */}
                    {renderRowActions && (
                      <td className={`px-3.5 ${densityRowClass} text-right whitespace-nowrap`}>
                        <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          {renderRowActions(row)}
                        </div>
                        {/* Kebab menu trigger fallback for mobile touch */}
                        <div className="inline-flex sm:hidden items-center justify-end text-dash-text-muted">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
