import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <section className="empty empty--page">
            <span className="empty__badge sticker accent-pink">404</span>
            <h1>This page has a bus factor of zero.</h1>
            <p className="muted">Nobody's maintaining it, mostly because it doesn't exist.</p>
            <Link to="/" className="btn btn--primary">
                <ArrowLeft size={16} strokeWidth={2.6} aria-hidden="true" /> Back to your repos
            </Link>
        </section>
    );
}
