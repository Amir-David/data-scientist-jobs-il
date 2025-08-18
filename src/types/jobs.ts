export interface Job {
    id: string;
    title: string;
    company_name: string;
    from: string;
    absolute_url: string;
    updated_at?: string;
    first_published?: string;
    scraped_at: string;
    location?: { name?: string };
}
