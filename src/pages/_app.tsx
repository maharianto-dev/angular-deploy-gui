import { AppProps } from "next/app";
import Layout from "../components/ui/layout/Layout";

import "../style.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout >
      <Component {...pageProps} />
    </Layout>
  );
}
