'use client';

import { useEffect, useState } from 'react';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';

export default function Page() {
    const [data, setData] = useState([]);
    const [charts, setCharts] = useState({
        barChart: [],
        topPie: [],
        sourcePie: [],
        areaChart: [],
    });

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('/api/read');
                const result = await response.json();

                if (result.success) {
                    setData(result.data.raw);
                    setCharts(result.data);
                }
            } catch (error) {}
        };

        fetchJobs();
    }, []);

    if (
        !data.length ||
        !charts.barChart.length ||
        !charts.topPie.length ||
        !charts.sourcePie.length ||
        !charts.areaChart.length
    )
        return null;

    return (
        <div>
            <SiteHeader />
            <div className='flex flex-1 flex-col'>
                <div className='@container/main flex flex-1 flex-col gap-2'>
                    <div className='flex flex-col gap-4 py-4 md:gap-4 md:py-6'>
                        <SectionCards
                            data={data}
                            barChartData={charts.barChart}
                            topPieData={charts.topPie}
                            sourcePieData={charts.sourcePie}
                        />
                        <div className='px-4 lg:px-6'>
                            <ChartAreaInteractive areaChartData={charts.areaChart} />
                        </div>
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
