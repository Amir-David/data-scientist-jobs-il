import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { head, put } from '@vercel/blob';
import { Job } from '@/types/jobs';
import { collectLinkedinJobs } from '@/lib/linkedinScraper';
import { collectGreenhouseJobs } from '@/lib/greenhouseScraper';

export async function GET() {
    const blobPath = 'jobs.csv';

    let csvExists = false;
    let existingUrl = '';
    try {
        const blob = await head(blobPath);
        csvExists = true;
        existingUrl = blob.url;
    } catch (error) {
        csvExists = false;
    }

    const [linkedinJobs, greenhouseJobs] = await Promise.all([
        collectLinkedinJobs('linkedin', csvExists),
        collectGreenhouseJobs('greenhouse', csvExists),
    ]);

    const scrapedJobs = [...linkedinJobs, ...greenhouseJobs];
    let allJobs: Job[] = [];

    try {
        if (existingUrl && csvExists) {
            const response = await fetch(existingUrl);
            const existingData = await response.text();
            const parsed = Papa.parse<Job>(existingData, { header: true, skipEmptyLines: true });
            allJobs = parsed.data;
        }
        const existingIds = new Set(allJobs.map((j) => j.id));
        const updatedJobs = [...allJobs, ...scrapedJobs.filter((j) => !existingIds.has(j.id))];
        console.log(...scrapedJobs.filter((j) => !existingIds.has(j.id)));
        const csvData = Papa.unparse(updatedJobs);
        await put(blobPath, csvData, {
            access: 'public',
            allowOverwrite: true,
        });

        return NextResponse.json({
            success: true,
            new_jobs_found: updatedJobs.length - allJobs.length,
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Failed to update data', { status: 500 });
    }
}
