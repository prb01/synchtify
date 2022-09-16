import Head from "next/head";
import Script from "next/script";

export default function CommonHead() {
  return (
    <Head>
      <meta charset="utf-8" />
      <link rel="shortcut icon" href="/favicon.ico" key="shortcutIcon" />
      
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta
        name="description"
        content="Combine & synchronise your favourite Spotify playlists."
      />
      <meta name="theme-color" content="#000000" />
      <meta property="og:site_name" content="Synchtify" />
      <meta
        property="og:description"
        content="Combine & synchronise your favourite Spotify playlists."
      />
      <meta
        property="og:title"
        content="Synchtify | Spotify Playlist Combiner/Syncher"
      />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/logo-share.png" />
      <meta property="og:url" content="https://synchtify.com" />

      <link rel="manifest" href="/manifest.json" />
      <title key="title">Synchtify | Spotify Playlist Combiner/Syncher</title>
      <Script lazyOnload src="/appCheck.js" />
    </Head>
  );
}
