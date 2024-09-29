import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h2>Not Found</h2>
      <Link to="/">Go Home</Link>
    </div>
  );
}