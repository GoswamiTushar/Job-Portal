import Head from 'next/head';
import { useRouter } from 'next/router';
import { files } from './_static'

const defaultMeta = {
    title: 'MyJob Portal',
    site_name: 'MyJob Squareboat Website',
    description:
        'JobPortal Dummy Project for initial practice. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates, mollitia.',
    url: process.env.NEXT_PUBLIC_WEBSITE_URL,
    image: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/images/landingPage/lpimage.png`,
    type: 'website',
    robots: 'follow, index',
    favicon: process.env.NEXT_PUBLIC_WEBSITE_URL + files.favicon
};

type SeoProps = {
    title?: string;
    description?: string;
    image?: string;
} & Partial<typeof defaultMeta>;

export default function Seo(props: SeoProps) {
    const { asPath } = useRouter();
    const meta = {
        ...defaultMeta,
        ...props,
    };

    return (
        <Head>
            <title>{meta.title}</title>
            <meta name='robots' content={meta.robots} />
            <meta content={meta.description} name='description' />
            <meta property='og:url' content={`${meta.url}${asPath}`} />
            <link rel='canonical' href={meta.url} />
            {/* Open Graph */}
            <meta property='og:type' content={meta.type} />
            <meta property='og:site_name' content={meta.site_name} />
            <meta property='og:description' content={meta.description} />
            <meta property='og:title' content={meta.title} />
            <meta property='og:image' content={meta.image} />
            <meta property='og:image:url' content={meta.image} />
            <meta property='og:image:alt' content='Job portal' />
            <meta property='og:image:type' content='images/png' />
            <meta property='og:image:width' content='1200' />
            <meta property='og:image:height' content='630' />
            <meta http-equiv='cache-control' content='no-cache' />
            <meta http-equiv='expires' content='0' />
            <meta http-equiv='pragma' content='no-cache' />
            {/* Twitter */}
            <meta name='twitter:card' content='summary_large_image' />
            {/* <meta name="twitter:site" content="@th_clarence" /> */}
            <meta name='twitter:title' content={meta.title} />
            <meta name='twitter:description' content={meta.description} />
            <meta name='twitter:image' content={meta.image} />
            <meta property='twitter:image:alt' content='Grid Desgin Studio' />

            <link rel='shortcut icon' href={meta.favicon} />
            <meta name='msapplication-TileColor' content='#ffffff' />
            <meta name='msapplication-TileImage' content={meta.image} />
            <meta name='theme-color' content='#ffffff' />
            <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale = 1.0, user-scalable = no" />
        </Head>
    );
}