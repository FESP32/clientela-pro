"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type FeatureSplitProps = {
  imageSrc: string;
  imageAlt?: string;
  /** image-left (default) | image-right */
  order?: "image-left" | "image-right";
  /** Pass any React content (headings, lists, buttons, etc.) */
  content: ReactNode;
  className?: string;
};

export default function FeatureSplit({
  imageSrc,
  imageAlt = "Illustration",
  order = "image-left",
  content,
  className = "",
}: FeatureSplitProps) {
  return (
    <section className={`mx-auto max-w-6xl px-4 py-14 ${className}`}>
      <div
        className={`grid grid-cols-1 items-center gap-12 md:grid-cols-2 ${
          order === "image-right" ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Image */}
        <div className="flex justify-center md:justify-end">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={0} // width/height set to 0 to allow `sizes` control
            height={0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-auto w-full max-w-lg object-contain"
            priority
          />
        </div>

        {/* Content (fully controlled by parent) */}
        <div>{content}</div>
      </div>
    </section>
  );
}
