import React, { useState, useEffect, useRef, useCallback } from 'react';

interface RecycleViewProps<T> {
  minHeight: number;
  minWidth: number;
  gap: number;
  renderItem: (item: T) => JSX.Element;
  loadMore: () => Promise<Array<T>>;
}

interface Column {
  height: number;
  items: JSX.Element[];
}

export function RecycleView<T>({
  minHeight,
  minWidth,
  gap,
  renderItem,
  loadMore,
}: RecycleViewProps<T>) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Array<T>>([]);

  const getColumnCount = useCallback(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    let columnCount = Math.floor((containerWidth + gap) / (minWidth + gap));
    console.log('@@@@@2', columnCount);
    columnCount = Math.max(1, columnCount);
    columnCount = Math.min(items.length, columnCount);
    return columnCount;
  }, [items.length, gap, minWidth]);

  const updateColumns = useCallback(() => {
    const columnCount = getColumnCount();
    const newColumns: Column[] = [];
    for (let i = 0; i < columnCount; i++) {
      newColumns.push({ height: 0, items: [] });
    }
    for (let i = startIndex; i < Math.min(items.length, endIndex); i++) {
      const item = items[i];
      const index = newColumns.reduce(
        (prevIndex, column, currentIndex) =>
          column.height < newColumns[prevIndex].height
            ? currentIndex
            : prevIndex,
        0
      );
      newColumns[index].height += minHeight + gap;
      newColumns[index].items.push(renderItem(item));
    }
    setColumns(newColumns);
  }, [startIndex, endIndex, items, getColumnCount, renderItem, minHeight, gap]);

  const handleResize = useCallback(() => {
    const columnCount = getColumnCount();
    if (columns.length !== columnCount) {
      setColumns([]);
    }
  }, [getColumnCount, columns.length]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const currentStartIndex = Math.floor(scrollTop / (minHeight + gap));
    const currentEndIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + clientHeight) / (minHeight + gap)) - 1
    );
    setStartIndex(currentStartIndex);
    setEndIndex(currentEndIndex);
  }, [minHeight, gap, items.length]);

  useEffect(() => {
    updateColumns();
  }, [startIndex, endIndex, updateColumns]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.addEventListener('scroll', handleScroll);
    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    const loadData = async () => {
      const items = await loadMore();
      console.log('@@@@@@@@', items);
      setItems(items);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (columns.length === 0) {
      updateColumns();
    }
  }, [columns.length, updateColumns]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {columns.map((column, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: index * (minWidth + gap),
            width: minWidth,
            height: column.height - gap,
          }}
        >
          {column.items}
        </div>
      ))}
      <div style={{ height: endIndex * (minHeight + gap) }}>
        {startIndex > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: startIndex * (minHeight + gap),
            }}
          />
        )}
        {endIndex < items.length && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: (items.length - endIndex) * (minHeight + gap),
            }}
          />
        )}
      </div>
    </div>
  );
}
