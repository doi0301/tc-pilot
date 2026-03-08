"use client";

/**
 * T-013: EditableTable 공통 컴포넌트
 * TanStack Table 기반, Design System Data Table 스타일
 * - 헤더: bg-sidebar, 행 hover, FAIL 행 강조
 * - 컬럼 정의, 셀 편집, 정렬 가능
 */
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Row,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

export interface EditableTableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: { row: Row<T>; getValue: () => unknown }) => React.ReactNode;
  editable?: boolean;
  enableSorting?: boolean;
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
}

export interface EditableTableProps<T> {
  columns: EditableTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  onDataChange?: (rowIndex: number, field: string, value: unknown) => void;
  getRowHighlight?: (row: T) => "fail" | "selected" | undefined;
  minWidth?: number;
  tableClassName?: string;
}

const tableStyles = {
  header: {
    background: "var(--bg-sidebar)",
    color: "var(--text-secondary)",
    fontSize: "12px",
    fontWeight: 500,
    height: "var(--table-header-height, 36px)",
    borderBottom: "2px solid var(--border-bold)",
    padding: "0 12px",
  },
  row: {
    height: "var(--table-row-height, 40px)",
    borderBottom: "1px solid var(--border-subtle)",
    padding: "0 12px",
  },
  rowHover: "var(--bg-hover)",
  rowFail: {
    background: "var(--status-fail-bg)",
    borderLeft: "3px solid var(--point-default)",
  },
  rowSelected: {
    background: "var(--bg-selected)",
  },
};

export function EditableTable<T extends object>({
  columns,
  data,
  getRowId,
  onDataChange,
  getRowHighlight,
  minWidth = 800,
  tableClassName = "",
}: EditableTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    return columns.map((col) => ({
      id: col.id,
      header: col.header,
      accessorKey: col.accessorKey as string,
      accessorFn: col.accessorFn,
      enableSorting: col.enableSorting ?? false,
      size: typeof col.width === "number" ? col.width : undefined,
      meta: {
        editable: col.editable,
        headerClassName: col.headerClassName,
        cellClassName: col.cellClassName,
      },
      cell: ({ row, getValue }) => {
        if (col.cell) {
          return col.cell({ row, getValue });
        }
        const val = getValue();
        if (col.editable && onDataChange) {
          return (
            <input
              type="text"
              value={String(val ?? "")}
              onChange={(e) => onDataChange(row.index, col.id, e.target.value)}
              className="w-full min-w-0 px-2 py-1 text-sm rounded border bg-transparent"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          );
        }
        return (
          <span style={{ color: "var(--text-primary)" }}>
            {val != null ? String(val) : "-"}
          </span>
        );
      },
    }));
  }, [columns, onDataChange]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => getRowId((row as { original: T }).original),
  });

  return (
    <div
      className={`rounded-lg border overflow-x-auto ${tableClassName}`}
      style={{ borderColor: "var(--border-default)" }}
    >
      <table
        className="w-full"
        style={{ minWidth }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const col = columns.find((c) => c.id === header.id);
                const canSort = col?.enableSorting ?? false;
                return (
                  <th
                    key={header.id}
                    className={`text-left py-2 px-3 text-sm font-medium whitespace-nowrap ${
                      canSort ? "cursor-pointer select-none" : ""
                    } ${col?.headerClassName ?? ""}`}
                    style={{
                      ...tableStyles.header,
                      width: col?.width,
                    }}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {canSort && (
                        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? ""}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const highlight = getRowHighlight?.(row.original);
            return (
              <tr
                key={row.id}
                className="hover:bg-[var(--bg-hover)]"
                style={{
                  ...tableStyles.row,
                  ...(highlight === "fail" ? tableStyles.rowFail : {}),
                  ...(highlight === "selected" ? tableStyles.rowSelected : {}),
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const col = columns.find((c) => c.id === cell.column.id);
                  return (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 align-top ${col?.cellClassName ?? ""}`}
                      style={{ width: col?.width }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
