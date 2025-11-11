// components/blog/PostContent.tsx
// Kiro: use this wrapper ONLY for blog sub-pages (/blog/[slug]) to normalize spacing.

import React from "react";

type PostContentProps = {
  children: React.ReactNode;
};

export default function PostContent({ children }: PostContentProps) {
  return (
    <article
      className="
        prose prose-slate max-w-none
        leading-relaxed text-[17px] md:text-[18px]

        [&>h1]:mt-0 [&>h1]:mb-4
        [&>h2]:mt-10 [&>h2]:mb-4
        [&>h3]:mt-8  [&>h3]:mb-3
        [&>h4]:mt-6  [&>h4]:mb-2

        [&>p]:my-4
        [&>ul]:my-4 [&>ol]:my-4
        [&>li]:my-1

        [&>img]:my-6 [&>figure]:my-6
        [&>hr]:my-8
        [&>blockquote]:my-6
        [&>table]:my-6 [&>pre]:my-6

        [&>*:first-child]:mt-0
        [&>*:last-child]:mb-0
      "
    >
      {children}
    </article>
  );
}
