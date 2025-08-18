import axios from 'axios';
import * as cheerio from 'cheerio';
import randomUseragent from 'random-useragent';
import { Job } from '@/types/jobs';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeLinkedInJobId(jobUrl: string, entityUrn?: string): string {
    const idFromUrl =
        jobUrl.match(/-(\d+)(?:\?|$)/)?.[1] || jobUrl.split('view/')[1]?.split('?')[0] || '';
    if (idFromUrl) return idFromUrl;
    if (entityUrn) {
        const urnMatch = entityUrn.match(/jobPosting:(\d+)/);
        if (urnMatch && urnMatch[1]) return urnMatch[1];
    }
    return '';
}

async function scrapeJobs(
    domain: string,
    start: number,
    csvExists: boolean
): Promise<{ jobs: Job[]; done: boolean }> {
    const url = csvExists
        ? `https://www.${domain}.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=%22Data%20Scientist%22&geoId=101620260&f_TPR=r86400&start=${start}`
        : `https://www.${domain}.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=%22Data%20Scientist%22&geoId=101620260&start=${start}`;

    const userAgent = randomUseragent.getRandom();
    const headers = {
        'User-Agent': userAgent,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: 'https://www.linkedin.com/jobs/search',
        'X-Requested-With': 'XMLHttpRequest',
        Connection: 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        DNT: '1',
        'Upgrade-Insecure-Requests': '1',
        Cookie: '',
        Origin: 'https://www.linkedin.com',
        Host: 'www.linkedin.com',
    };
    try {
        const { data: html, status } = await axios.get(url, {
            headers,
            validateStatus: (status) => status === 200 || status === 400,
            timeout: 15000,
            maxRedirects: 5,
        });

        if (html.includes('captcha')) {
            throw new Error('LinkedIn is requesting captcha verification');
        }

        const $ = cheerio.load(html);
        const scrapeDate = new Date().toISOString();
        const items = $('li');

        const jobs: Job[] = items
            .map((_, element) => {
                try {
                    const job = $(element);
                    const title = job.find('.base-search-card__title').text().trim();
                    const company_name = job.find('.base-search-card__subtitle').text().trim();
                    const absolute_url = job.find('.base-card__full-link').attr('href') || '';
                    const updated_at = job.find('time').attr('datetime') || '';
                    const entityUrn = job.attr('data-entity-urn') || '';
                    const id = normalizeLinkedInJobId(absolute_url, entityUrn);
                    const from = 'Linkedin';

                    if (!title || !company_name || !absolute_url || !updated_at || !id) {
                        return null;
                    }

                    return {
                        title,
                        company_name,
                        absolute_url,
                        updated_at,
                        scraped_at: scrapeDate,
                        id,
                        from,
                    };
                } catch (err) {
                    console.warn('Error parsing job element:', err);
                    return null;
                }
            })
            .get()
            .filter(Boolean) as Job[];

        if (status === 400 || jobs.length === 0) {
            return { jobs: [], done: true };
        }

        return { jobs, done: false };
    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    }
}

export async function collectLinkedinJobs(
    domain: string,
    csvExists: boolean = true
): Promise<Job[]> {
    let scrapedJobs: Job[] = [];
    const MAX_CONSECUTIVE_ERRORS = 3;
    const BATCH_SIZE = 10;
    const MAX_EXECUTION_TIME = csvExists ? 30000 : 60000;
    const startTime = Date.now();
    let consecutiveErrors = 0;
    let start = 0;
    let done = false;
    while (!done) {
        try {
            const { jobs, done: stop } = await scrapeJobs(domain, start, csvExists);
            scrapedJobs = [...scrapedJobs, ...jobs];
            if (stop) {
                done = true;
                break;
            }
            consecutiveErrors = 0;
            start += BATCH_SIZE;
            if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                break;
            }
            await delay(1000 + Math.random() * 500);
        } catch (error) {
            consecutiveErrors++;
            console.error(`Error fetching batch (attempt ${consecutiveErrors}):`, error);

            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                break;
            }

            await delay(Math.pow(2, consecutiveErrors) * 1000);
        }
    }

    return scrapedJobs;
}
