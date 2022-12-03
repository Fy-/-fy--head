# @fy-/head

Simple head manager for Vue3/Vite (supports SSR)

## Install

    npm i @fy-/head

## Load Vue Plugin

    import { createFyHead } from  '@fy-/head';
    export const createApp = (isSSR = false) => {
     //...
     const fyhead = createFyHead();
     app.use(fyhead);
     return { app, router, head: fyhead, pinia, ... }
    }

## "Lazy SEO" usage

    import { useFyHead } from '@fy-/head';
    const fyhead = useFyHead();
    fyhead.lazySeo({
      name: 'fyvue',
      type: 'website',
      image: 'https://fy-vue.com/fyvue.png',
      title: 'My Super Website'
    });

## Helpers usage

    import { useFyHead } from '@fy-/head';
    const fyhead = useFyHead();
    fyhead.addMeta('og:description', 'My super description');
    fyhead.addMeta('description', 'My super website', 'name');
    fyhead.addLink('next', 'https://mysuperwebsite.fy.to/?page=2');
    fyhead.addTitle('My Super Website');
    fyhead.addScript('https://js.stripe.com/v3', 'stripe-script');

## Element API usage

    import { useFyHead, El, ElProperty } from '@fy-/head';
    const fyhead = useFyHead();
    fyhead.addElement(new El('title', [], 'title', 'My Super Website'));
    fyhead.addElement(
      new El(
          'link',
          [
            new ElProperty('rel', 'next'),
            new ElProperty('href', 'https://mysuperwebsite.fy.to/?page=2')
        ],
        'mySuperKey' // undefined will generate an uuid
        )
    );

## SSR Usage

    const { app, router, head, pinia } = await createApp(true);
    //....
    const { headTags, htmlAttrs, bodyAttrs, bodyTags } = head.renderHeadToString();
    // @fy-/head only supports headTags at (htmlAttrs, bodyAttrs & bodyTags will be empty strings)
