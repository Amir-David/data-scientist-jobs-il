import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET() {
    try {
        const blob = await head('jobs.csv');
        const response = await fetch(blob.url);
        const csvData = await response.text();

        return new NextResponse(csvData, {
            headers: {
                'Content-Type': 'text/csv',
            },
        });
    } catch (error) {
        return new NextResponse('File not found', { status: 404 });
    }
}
