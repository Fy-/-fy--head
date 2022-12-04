
# @fy-/head

Simple head manager for Vue3/Vite (supports SSR) inspired by @vueuse/head.

## Install

    npm i @fy-/head

## Load Vue Plugin

    import {
        createFyHead
    } from '@fy-/head';
    export const createApp = async (isSSR = false) => {
        //...
        const fyhead = createFyHead();
        app.use(fyhead);
        //...
        return {
            app,
            router,
            head: fyhead,
            pinia
        };
    };

## Usage

    import {
        useFyHead
    } from '@fy-/head';

    // Simple
    useFyHead({
        title: computed(() =>
            computedRoute.value.meta.title ? computedRoute.value.meta.title : 'fyvue'
        ),
        metas: [{
                property: 'og:type',
                content: 'website',
            },
            {
                property: 'og:image',
                content: 'https://fy-vue.com/fyvue.png',
            },
            {
                name: 'twitter:image',
                content: 'https://fy-vue.com/fyvue.png',
            },
        ],
    });

    // Script example
    useFyHead({
        scripts: [{
            src: 'https://js.stripe.com/v3',
            id: 'stripe-script',
        }, ],
    });

    // Fully reactive example (in this example "seo" is a Ref)
    useFyHead({
        title: computed(() => seo.value.title),
        links: computed(() => {
            const _res: Array < any > = [];

            if (initial && getMode() == 'ssr') {
                _res.push({
                    rel: 'canonical',
                    href: `${getUrl().scheme}://${getUrl().host}${getUrl().path}`,
                    key: 'canonical',
                });
            }
            if (seo.value.prev) {
                _res.push({
                    rel: 'prev',
                    href: seo.value.prev,
                    key: 'prev',
                });
            }
            if (seo.value.next) {
                _res.push({
                    rel: 'next',
                    href: seo.value.next,
                    key: 'next',
                });
            }
            return _res;
        }),
        //...
    });


