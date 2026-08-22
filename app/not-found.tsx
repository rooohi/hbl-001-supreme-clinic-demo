import { Header,Footer } from "@/components/site-shell";
import Link from "next/link";
export default function NotFound(){return <><Header/><main className="detail-hero"><div className="container narrow"><p className="eyebrow">404</p><h1>This page is not part of the workflow.</h1><p>Return to the homepage or tell us what you want to automate.</p><Link className="button" href="/">Back to homepage</Link></div></main><Footer/></>}
