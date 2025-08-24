"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export function QR({
  value,
  size = 220,
  className,
}: {
  value: string; // can be absolute or a path like "/dashboard/..."
  size?: number;
  className?: string;
}) {
  const [url, setUrl] = useState(value);

  useEffect(() => {
    // If a relative path is provided, make it absolute on the client
    if (value.startsWith("/") && typeof window !== "undefined") {
      setUrl(new URL(value, window.location.origin).toString());
    } else {
      setUrl(value);
    }
  }, [value]);

  return (
    <QRCodeCanvas value={url} size={size} includeMargin className={className} />
  );
}
