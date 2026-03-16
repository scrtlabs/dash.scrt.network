import Title from "components/Title";
import mixpanel from "mixpanel-browser";
import { useEffect } from "react";
import {
  sendJsonLdSchema,
  sendPageDescription,
  sendPageTitle,
} from "utils/commons";
import SendForm from "./components/SendForm";

export function Send() {
  useEffect(() => {
    if (import.meta.env.VITE_MIXPANEL_ENABLED === "true") {
      mixpanel.init(import.meta.env.VITE_MIXPANEL_PROJECT_TOKEN, {
        debug: false,
      });
      mixpanel.identify("Dashboard-App");
      mixpanel.track("Open Wrap Tab");
    }
  }, []);

  return (
    <>
      <title>{sendPageTitle}</title>

      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <meta name="title" content={sendPageTitle} />
      <meta name="application-name" content={sendPageTitle} />
      <meta name="description" content={sendPageDescription} />
      <meta name="robots" content="index,follow" />

      <meta property="og:title" content={sendPageTitle} />
      <meta property="og:description" content={sendPageDescription} />
      {/* <meta property="og:image" content="Image URL Here"/> */}

      <meta name="twitter:title" content={sendPageTitle} />
      <meta name="twitter:description" content={sendPageDescription} />
      {/* <meta name="twitter:image" content="Image URL Here"/> */}

      <script type="application/ld+json">
        {JSON.stringify(sendJsonLdSchema)}
      </script>

      <div className="container w-full max-w-xl mx-auto px-4">
        {/* Title*/}
        <Title
          title={`Send`}
          tooltip={`Transfer your assets to a given address`}
          className="mb-6"
        />
        {/* Content */}
        <div className="rounded-3xl px-6 py-6 bg-white border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
          <SendForm />
        </div>
      </div>
    </>
  );
}
