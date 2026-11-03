# EMBER coffee shop

The user approved the second interactive concept by requesting its implementation in this repository. Build the continuous 3D scroll experience, rather than the first editorial mockup. The requested stack is Next.js, TypeScript, Tailwind CSS, and Payload CMS.

The experience retains the SLOW DOWN hero, orbiting coffee beans, rotating branded ceramic cup, origin chapter, brewing chapter, overhead latte close-up, circular transition, horizontal menu, café photograph, and footer. Native scrolling drives a reversible GSAP timeline. Mobile keeps the same journey with different framing. Reduced motion presents ordinary readable sections without pinned or scrubbed movement. WebGL failure leaves a photographic fallback and usable content.

Use the existing repository in place on `main`. Do not create other branches or worktrees. Local SQLite keeps the application self-contained. Payload provides authenticated administration, media uploads, a homepage global, a site-settings global, and a menu collection. The frontend reads persisted content on the server. Menu prices, descriptions, tasting notes, photographs, page copy, location, and hours are editable. No checkout, reservations, fabricated business contact, deployment, or shared-branch push is part of this task.

Keep the 3D renderer and scroll timeline separate. Scope DOM selection, GSAP state, event listeners, and cleanup to the React component. Dispose graphics resources on unmount and guard asynchronous startup so React Strict Mode cannot leak render loops. Derive recipe counters and navigation from shared scroll helpers.

The original assets are local images from Unsplash, with source attribution. Fonts are self-hosted. Keep credentials, SQLite databases, uploaded files, build artifacts, and test output out of Git. Seed sample content idempotently without creating an administrator or overwriting edited content. Include database migrations and setup documentation.

Verify the production build, TypeScript, real database access controls and seed behavior, desktop and mobile rendering, full forward and reverse scrolling, menu details and focus restoration, reduced motion, and CMS-to-page updates.
