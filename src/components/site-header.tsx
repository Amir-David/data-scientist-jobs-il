import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SiteHeader() {
    return (
        <header className='sticky top-0 bg-white/30 backdrop-blur-sm z-[100] flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
            <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
                <Button
                    variant='link'
                    asChild
                    className='h-auto p-0 text-lg font-semibold text-black dark:text-foreground'
                >
                    <Link href='/'>data-scientist-jobs-il</Link>
                </Button>

                <div className='ml-auto flex items-center gap-2'>
                    <Button variant='link' asChild size='sm' className='hidden sm:flex'>
                        <a
                            href='https://github.com/Amir-David/data-scientist-jobs-il'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='dark:text-foreground'
                        >
                            GitHub
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
}
