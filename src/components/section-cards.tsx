import { ChartPieSimple } from '@/components/chart-pie-card';
import { ChartBarMultiple } from '@/components/chart-bar-card';
import { Job } from '@/types/jobs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionCards({
    data,
    barChartData,
    topPieData,
    sourcePieData,
}: {
    data: Job[];
    barChartData: Job[];
    topPieData: Job[];
    sourcePieData: Job[];
}) {
    return (
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
            <Card className='@container/card text-center'>
                <CardHeader>
                    <CardDescription>Data Scientist Jobs in Israel on Our Site</CardDescription>
                    <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                        {data.length}
                    </CardTitle>
                </CardHeader>
                <CardHeader>
                    <CardDescription>New Jobs Collected Today</CardDescription>
                    <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                        {(barChartData[0]?.Linkedin ?? 0) + (barChartData[0]?.Career_Sites ?? 0)}
                    </CardTitle>
                </CardHeader>
            </Card>
            <ChartBarMultiple barChartData={barChartData} />
            <ChartPieSimple
                data={sourcePieData}
                nameKey='from'
                title='LinkedIn vs. Official Company Career Sites'
            />
            <ChartPieSimple data={topPieData} nameKey='company' title='Top 5 Hiring Companies' />
        </div>
    );
}
