import axios from 'axios';
import randomUseragent from 'random-useragent';
import { Job } from '@/types/jobs';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const allowedLocations = ['tel aviv', 'netanya', 'ramat gan', 'herzliya', 'haifa', 'israel'];

async function scrapeJobs(
    domain: string,
    name: string,
    csvExists: boolean
): Promise<{ jobs: Job[]; done: boolean }> {
    const url = `https://boards-api.${domain}.io/v1/boards/${name}/jobs`;
    const userAgent = randomUseragent.getRandom();
    const headers = {
        'User-Agent': userAgent,
        Accept: 'application/json',
    };
    try {
        const { data } = await axios.get(url, {
            headers,
            validateStatus: (status) => status === 200,
            timeout: 15000,
            maxRedirects: 5,
        });

        const scrapeDate = new Date().toISOString();

        const jobs: Job[] = (data.jobs as Job[])
            .map((job) => {
                try {
                    const title = job.title;
                    const company_name = job.company_name || name;
                    const absolute_url = job.absolute_url;
                    const updated_at = job.updated_at || job.first_published;
                    const location = job.location?.name;
                    const id = String(job.id);
                    const from = `${job.company_name || name} Careers`;

                    if (
                        !title ||
                        !company_name ||
                        !absolute_url ||
                        !updated_at ||
                        !id ||
                        !location ||
                        !allowedLocations.some((loc) => location.toLowerCase().includes(loc)) ||
                        !(
                            title.toLowerCase().includes('data') &&
                            title.toLowerCase().includes('scientist')
                        ) ||
                        (csvExists &&
                            new Date(updated_at).getTime() < Date.now() - 12 * 60 * 60 * 1000)
                    ) {
                        return null;
                    }

                    return {
                        title,
                        company_name,
                        absolute_url,
                        updated_at,
                        scraped_at: scrapeDate,
                        id,
                        location,
                        from,
                    };
                } catch (err) {
                    console.warn('Error parsing job element:', err);
                    return null;
                }
            })
            .filter(Boolean) as Job[];

        return { jobs, done: true };
    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    }
}

export async function collectGreenhouseJobs(
    domain: string,
    csvExists: boolean = true
): Promise<Job[]> {
    let scrapedJobs: Job[] = [];
    const boardTokens = [
        'wizinc',
        'teads1',
        'unity3d',
        'vonage',
        'safebreach',
        'pontera',
        'catonetworks',
        'honeycombinsurance',
        'apiiro',
        'placerlabs',
        'nebius',
        'orcasecurity',
        'pendo',
        'connecteam',
        'pingidentity',
        'tipaltisolutions',
        'rhinofederatedcomputing',
        'wekatest',
        'via',
        'riskified',
        'rubrik',
        'appsflyer',
        'lightricks',
        'apono',
        'beyondtrust',
    ];

    const MAX_CONSECUTIVE_ERRORS = 3;
    const MAX_EXECUTION_TIME = csvExists ? 30000 : 60000;

    for (const name of boardTokens) {
        const startTime = Date.now();
        let consecutiveErrors = 0;
        let done = false;
        while (!done) {
            try {
                const { jobs, done: stop } = await scrapeJobs(domain, name, csvExists);
                scrapedJobs = [...scrapedJobs, ...jobs];
                if (stop) {
                    done = true;
                    await delay(1000 + Math.random() * 500);
                    break;
                }
                if (Date.now() - startTime > MAX_EXECUTION_TIME) {
                    break;
                }
            } catch (error) {
                consecutiveErrors++;
                console.error(`Error fetching batch (attempt ${consecutiveErrors}):`, error);

                if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                    break;
                }

                await delay(Math.pow(2, consecutiveErrors) * 1000);
            }
        }
    }

    return scrapedJobs;
}
