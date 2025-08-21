'use client';
import { Job } from '@/types/jobs';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'A multiple bar chart';

const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
    desktop: {
        label: 'Desktop',
        color: 'var(--chart-1)',
    },
    mobile: {
        label: 'Mobile',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function ChartBarMultiple({ barChartData: chartData }: { barChartData: Job[] }) {
    return (
        <Card className='p-0 gap-0'>
            <CardHeader className='text-center p-0 gap-0 m-1'>
                <CardDescription>Jobs Collected Over This Week</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
                <ChartContainer
                    config={chartConfig}
                    className='mx-auto aspect-square max-h-[170px]'
                >
                    <BarChart data={chartData.slice(0, 7)}>
                        <CartesianGrid vertical={false} horizontal={false} />
                        <XAxis
                            dataKey='date'
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 5)}
                            reversed
                        />
                        <ChartTooltip
                            cursor={true}
                            content={<ChartTooltipContent indicator='dashed' />}
                        />
                        <Bar dataKey='Linkedin' fill='#3B82F6' radius={4} />
                        <Bar dataKey='Career_Sites' fill='#EC4899' radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
