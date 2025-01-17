import { type PageProps } from "$fresh/server.ts";
import Header from "@/components/Header.tsx";
import Footer from "@/components/Footer.tsx";
import Sidebar from "@/islands/Sidebar.tsx";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Model as a Service - UI</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div id="app">
          <div className="v-application v-theme--trusteeLight v-layout v-layout--full-height v-locale--is-ltr">
            <div className="v-application__wrap">
              <Header />
              <div className="d-flex flex-grow-1">
                <Sidebar />
                <div className="d-flex flex-grow-1">
                  <main
                    className="v-main"
                    style={{
                      "--v-layout-left": "0px",
                      "--v-layout-right": "0px",
                      "--v-layout-top": "0px",
                      "--v-layout-bottom": "0px",
                    }}
                  >
                    <Component />
                  </main>
                </div>
              </div>
              <Footer />
              <div className="v-overlay-container" id="the-overlay-container">
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
