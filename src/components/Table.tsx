import React from 'react';

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: string | number }>({ 
  columns, 
  data, 
  isLoading, 
  emptyMessage = "No data found",
  onRowClick
}: TableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="glass-table-container min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4 text-blue-400">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-table-container w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="glass-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-4xl">📭</span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick && onRowClick(item)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {columns.map((col, i) => (
                    <td key={i}>
                      {col.render 
                        ? col.render(item) 
                        : col.accessor 
                          ? String(item[col.accessor] ?? '-')
                          : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
