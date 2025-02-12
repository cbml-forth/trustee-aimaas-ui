import { type PageProps } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
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
                <link
                    href="https://cdn.jsdelivr.net/npm/beercss@3.8.0/dist/cdn/beer.min.css"
                    rel="stylesheet"
                />
                <script
                    type="module"
                    src="https://cdn.jsdelivr.net/npm/beercss@3.8.0/dist/cdn/beer.min.js"
                >
                </script>
                <link rel="stylesheet" href="/styles-wine.css" />
            </head>
            <body class="light" f-client-nav>
                <Header />
                <main class="max">
                    <Sidebar />
                    <Partial name="body">
                        <Component />
                    </Partial>
                    <Footer />
                </main>
            </body>
        </html>
    );
}
