import { render, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Link, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { useDocumentTitle } from "./useDocumentTitle";

afterEach(cleanup);

function Page() {
  const { pathname } = useLocation();
  useDocumentTitle(pathname, undefined, { canonical: "https://pintask.online/" });
  return <Link to="/about">About</Link>;
}

describe("route canonical metadata", () => {
  it("self-references each page and updates during navigation despite a homepage override", async () => {
    const view = render(<MemoryRouter initialEntries={["/blog?utm_source=email"]}><Page /></MemoryRouter>);
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://pintask.online/blog"));
    fireEvent.click(view.getByRole("link", { name: "About" }));
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://pintask.online/about"));
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe("https://pintask.online/about");
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });
});