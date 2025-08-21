'use client';
import * as React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Job } from '@/types/jobs';
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from '@tabler/icons-react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
    FilterFn,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';

const globalFilterFn: FilterFn<Job> = (row, columnId, filterValue) => {
    const raw = row.getValue<unknown>(columnId);
    let text = String(raw ?? '');
    const d = new Date(text);
    if (!isNaN(d.getTime())) {
        text = d.toLocaleDateString('en-GB');
    }
    return text.toLowerCase().includes(String(filterValue ?? '').toLowerCase());
};

const columns: ColumnDef<Job>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='p-0 h-auto w-full justify-start inline-flex items-center gap-2 w-full justify-start text-left whitespace-normal min-w-[200px]'
            >
                <span className='min-w-0 line-clamp-2 text-left leading-tight'>Title</span>
                <ArrowUpDown className='h-4 w-4 shrink-0' />
            </Button>
        ),
        cell: ({ row }) => {
            const title = row.original.title;
            const url = row.original.absolute_url;
            return (
                <Button
                    className='line-clamp-2 break-words leading-tight p-0 w-full justify-start text-left whitespace-normal pl-3'
                    variant='link'
                    onClick={() => window.open(url)}
                >
                    {title}
                </Button>
            );
        },
    },
    {
        accessorKey: 'company_name',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='p-0 h-auto w-full justify-start inline-flex items-center gap-2 ww-full justify-start text-left whitespace-normal'
            >
                <span className='min-w-0 line-clamp-2 text-left leading-tight'>Company</span>
                <ArrowUpDown className='h-4 w-4 shrink-0' />
            </Button>
        ),
        cell: ({ row }) => (
            <span className='line-clamp-2 break-words leading-tight p-0 w-full justify-start text-left whitespace-normal pl-3'>
                {row.original.company_name}
            </span>
        ),
    },
    {
        accessorKey: 'updated_at',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='p-0 h-auto w-full justify-start inline-flex items-center gap-2 w-full justify-start text-left whitespace-normall'
            >
                <span className='min-w-0 line-clamp-2 text-left leading-tight'>Published At</span>
                <ArrowUpDown className='h-4 w-4 shrink-0' />
            </Button>
        ),
        cell: ({ row }) => {
            const updated_at = new Date((row.original.updated_at ?? '').split('T')[0]);
            return (
                <span className='line-clamp-2 break-words leading-tight p-0 w-full justify-start text-left whitespace-normal pl-3'>
                    {updated_at.toLocaleDateString('en-GB')}
                </span>
            );
        },
    },
    {
        accessorKey: 'scraped_at',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='p-0 h-auto w-full justify-start inline-flex items-center gap-2 w-full justify-start text-left whitespace-normal'
            >
                <span className='min-w-0 line-clamp-2 text-left leading-tight'>Scraped At</span>
                <ArrowUpDown className='h-4 w-4 shrink-0' />
            </Button>
        ),
        cell: ({ row }) => {
            const scraped_at = new Date((row.original.scraped_at ?? '').split('T')[0]);
            return (
                <span className='line-clamp-2 break-words leading-tight p-0 w-full justify-start text-left whitespace-normal pl-3'>
                    {scraped_at.toLocaleDateString('en-GB')}
                </span>
            );
        },
    },
    {
        accessorKey: 'from',
        header: ({ column }) => (
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='p-0 h-auto w-full justify-start inline-flex items-center gap-2 w-full justify-start text-left whitespace-normal'
            >
                <span className='min-w-0 line-clamp-2 text-left leading-tight'>Posted At</span>
                <ArrowUpDown className='h-4 w-4 shrink-0' />
            </Button>
        ),
        cell: ({ row }) => (
            <span className='line-clamp-2 break-words leading-tight p-0 w-full justify-start text-left whitespace-normal pl-3'>
                {row.original.from}
            </span>
        ),
    },
];
export function DataTable({ data: initialData }: { data: Job[] }) {
    const [data, setData] = React.useState(() => initialData);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        getRowId: (row, index) => `${row.id}-${index}`,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6'>
            <div className='flex w-full items-center justify-center'>
                <Input
                    placeholder='Search Jobs'
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className='max-w-sm m-2 overflow-auto'
                />
            </div>
            <ScrollArea type='always' className='rounded-md'>
                <div className='overflow-hidden rounded-lg border'>
                    <Table className='w-full table-auto lg:table-fixed'>
                        <colgroup>
                            <col className='w-2/5' />
                            <col className='w-0.75/5' />
                            <col className='w-0.75/5' />
                            <col className='w-0.75/5' />
                            <col className='w-0.75/5' />
                        </colgroup>
                        <TableHeader className='bg-muted sticky top-0 z-10'>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className='h-24 text-center'
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <ScrollBar orientation='horizontal' />
            </ScrollArea>
            <div className='flex items-center justify-between px-4 m-1'>
                <div className='text-muted-foreground hidden flex-1 text-sm lg:flex'></div>
                <div className='flex w-full items-center gap-8 lg:w-fit'>
                    <div className='hidden items-center gap-2 lg:flex'>
                        <Label htmlFor='rows-per-page' className='text-sm font-medium'>
                            Rows per page
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger size='sm' className='w-20' id='rows-per-page'>
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side='top'>
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex w-fit items-center justify-center text-sm font-medium'>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className='ml-auto flex items-center gap-2 lg:ml-0'>
                        <Button
                            variant='outline'
                            className='hidden h-8 w-8 p-0 lg:flex'
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className='sr-only'>Go to first page</span>
                            <IconChevronsLeft />
                        </Button>
                        <Button
                            variant='outline'
                            className='size-8'
                            size='icon'
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className='sr-only'>Go to previous page</span>
                            <IconChevronLeft />
                        </Button>
                        <Button
                            variant='outline'
                            className='size-8'
                            size='icon'
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className='sr-only'>Go to next page</span>
                            <IconChevronRight />
                        </Button>
                        <Button
                            variant='outline'
                            className='hidden size-8 lg:flex'
                            size='icon'
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className='sr-only'>Go to last page</span>
                            <IconChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
