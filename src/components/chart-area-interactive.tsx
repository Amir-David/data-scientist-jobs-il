'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Job } from '@/types/jobs';

import { useIsMobile } from '@/hooks/use-mobile';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const description = 'An interactive area chart';

const chartConfig = {
    visitors: {
        label: 'Visitors',
    },
    desktop: {
        label: 'Desktop',
        color: '#3B82F6',
    },
    mobile: {
        label: 'Mobile',
        color: '#EC4899',
    },
} satisfies ChartConfig;

export function ChartAreaInteractive({ areaChartData: chartData }: { areaChartData: Job[] }) {
    const isMobile = useIsMobile();
    const [timeRange, setTimeRange] = React.useState('90d');

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange('7d');
        }
    }, [isMobile]);

    const diffMs = Date.now() - new Date(chartData[0].date ?? '').getTime();
    let daysToSubtract = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date ?? '');
        const referenceDate = Date.now();
        if (timeRange === '30d') {
            daysToSubtract = 30;
        } else if (timeRange === '7d') {
            daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
    });

    return (
        <Card className='@container/card'>
            <CardHeader>
                <CardTitle>Jobs Published Over Time</CardTitle>
                <CardDescription>
                    <span className='hidden @[540px]/card:block'>Source and Time Period</span>
                    <span className='@[540px]/card:hidden'></span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type='single'
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant='outline'
                        className='hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex'
                    >
                        <ToggleGroupItem value='All'>All</ToggleGroupItem>
                        <ToggleGroupItem value='30d'>Last Month</ToggleGroupItem>
                        <ToggleGroupItem value='7d'>Last Week</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className='flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden'
                            size='sm'
                            aria-label='Select a value'
                        >
                            <SelectValue placeholder='All' />
                        </SelectTrigger>
                        <SelectContent className='rounded-xl'>
                            <SelectItem value='All' className='rounded-lg'>
                                All
                            </SelectItem>
                            <SelectItem value='30d' className='rounded-lg'>
                                Last Month
                            </SelectItem>
                            <SelectItem value='7d' className='rounded-lg'>
                                Last Week
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                                <stop
                                    offset='5%'
                                    stopColor='var(--color-desktop)'
                                    stopOpacity={1.0}
                                />
                                <stop
                                    offset='95%'
                                    stopColor='var(--color-desktop)'
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id='fillMobile' x1='0' y1='0' x2='0' y2='1'>
                                <stop
                                    offset='5%'
                                    stopColor='var(--color-mobile)'
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset='95%'
                                    stopColor='var(--color-mobile)'
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US');
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString('en-US');
                                    }}
                                    indicator='dot'
                                />
                            }
                        />
                        <Area
                            dataKey='Career_Sites'
                            type='natural'
                            fill='url(#fillMobile)'
                            stroke='var(--color-mobile)'
                            stackId='a'
                        />
                        <Area
                            dataKey='Linkedin'
                            type='natural'
                            fill='url(#fillDesktop)'
                            stroke='var(--color-desktop)'
                            stackId='a'
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
