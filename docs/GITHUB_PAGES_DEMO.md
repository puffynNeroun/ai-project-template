# GitHub Pages Visual Demo

Forge includes a first static visual demo for the lifecycle:

    docs/pages-demo/index.html

The demo is designed to help a GitHub visitor understand Forge without reading only Markdown documentation.

## What the Demo Shows

The visual demo explains:

- what Forge is;
- how a task moves from definition to completion;
- how task contracts and artifacts work under the hood;
- why Forge makes AI-assisted development more scoped, reviewed, and verifiable.

## Source Files

The demo source lives in:

    docs/pages-demo/index.html
    docs/pages-demo/styles.css
    docs/pages-demo/app.js

The page is intentionally static and no-framework.

It does not require npm install, a build step, or a frontend framework.

## GitHub Pages Deployment

The repository includes a GitHub Actions workflow for Pages:

    .github/workflows/pages.yml

The workflow is intended to:

- run on pushes to `main`;
- support manual workflow dispatch;
- upload `docs/pages-demo` as the Pages artifact;
- deploy the artifact through GitHub Pages.

Repository settings may still need to be configured in GitHub:

1. Open the repository on GitHub.
2. Go to Settings.
3. Open Pages.
4. Select GitHub Actions as the Pages source.
5. Run the Pages workflow or push to `main`.

After deployment, GitHub will show the final Pages URL in the workflow summary and in the repository Pages settings.

## Local Preview

Open this file directly in a browser:

    docs/pages-demo/index.html

Or serve the folder locally:

    python3 -m http.server 8080 --directory docs/pages-demo

Then open:

    http://localhost:8080

## Accuracy Notes

This is a static visual demo.

It does not mean Forge currently includes:

- autonomous agent runner;
- SaaS dashboard;
- npm publishing;
- Telegram approvals;
- automatic PR creation;
- automatic code generation;
- backend service;
- authentication;
- analytics.

The demo presents the implemented Forge lifecycle and evidence model.
