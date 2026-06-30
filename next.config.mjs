/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export to ./out for GitHub Pages (no Node server at runtime).
  output: "export",
  // Repo is ItzzInfinity.github.io -> served at the domain root, so no basePath.
  // Emit /route/index.html so GitHub Pages serves nested routes without 404s.
  trailingSlash: true,
  // next/image optimisation needs a server; disable it for static export.
  images: { unoptimized: true },
};

export default nextConfig;
