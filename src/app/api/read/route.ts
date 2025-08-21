import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import Papa from 'papaparse';
import { Job } from '@/types/jobs';
import randomColor from 'randomcolor';

export async function GET() {
    try {
        const blob = await head('jobs.csv');
        const response = await fetch(blob.url);
        const csvData = await response.text();
        const parsed = Papa.parse<Job>(csvData, { header: true, skipEmptyLines: true });
        const data = parsed.data;

        const areaChartData: Job[] = Object.values(
            data.reduce((acc, { updated_at: date, from }) => {
                if (!date) return acc;
                if (!acc[date]) {
                    acc[date] = { date, Linkedin: 0, Career_Sites: 0 };
                }
                if (from === 'Linkedin') {
                    acc[date].Linkedin = (acc[date].Linkedin ?? 0) + 1;
                } else {
                    acc[date].Career_Sites = (acc[date].Career_Sites ?? 0) + 1;
                }
                return acc;
            }, {} as Record<string, Job>)
        ).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

        const barChartData: Job[] = Object.values(
            data.reduce((acc, { scraped_at, from }) => {
                const date = new Date(scraped_at?.split('T')[0] ?? '').toLocaleDateString('en-GB');
                if (!date) return acc;
                if (!acc[date]) {
                    acc[date] = { date, Linkedin: 0, Career_Sites: 0 };
                }
                if (from === 'Linkedin') {
                    acc[date].Linkedin = (acc[date].Linkedin ?? 0) + 1;
                } else {
                    acc[date].Career_Sites = (acc[date].Career_Sites ?? 0) + 1;
                }
                return acc;
            }, {} as Record<string, Job>)
        ).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

        const topPieData: Job[] = Object.values(
            data.reduce((acc, { company_name }) => {
                const company = company_name ?? '';
                if (!acc[company]) {
                    acc[company] = { company, count: 0, fill: randomColor() };
                }
                acc[company].count = (acc[company].count ?? 0) + 1;
                return acc;
            }, {} as Record<string, Job>)
        ).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

        const sourcePieData = Object.entries(
            data.reduce((a, { from }) => {
                const key = from === 'Linkedin' ? 'Linkedin' : 'Career_Sites';
                a[key] = (a[key] ?? 0) + 1;
                return a;
            }, {} as Record<string, number>)
        ).map(([from, count]) => ({
            from,
            count,
            fill: from === 'Linkedin' ? '#3B82F6' : '#EC4899',
        }));

        return NextResponse.json({
            success: true,
            data: {
                raw: data,
                areaChart: areaChartData,
                barChart: barChartData,
                topPie: topPieData,
                sourcePie: sourcePieData,
            },
        });
    } catch (error) {
        console.error('Error processing jobs data:', error);
        return NextResponse.json({ success: false }, { status: 404 });
    }
}
