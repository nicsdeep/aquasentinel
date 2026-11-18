"use client";

import { useState } from "react";
import Link from "next/link";
import { Presentation } from "lucide-react";

const SRC =
  "https://1drv.ms/p/c/4ab51b60751e64e8/IQRy9q5P02hrR7tT0V4YV4TYAdTjCxRlpACLsDbDrYQZIiw?wdAr=1.7777777777777777&wdEaaCheck=1";

/**
 * The owner's demo presentation, shown with Microsoft's PowerPoint viewer (OneDrive). It loads only after the visitor
 * chooses to view it, because Microsoft may set its own cookies (see the Cookies page). 16:9, full width.
 */
export function PptEmbed() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#e3edf2] bg-lp-band shadow-[0_10px_30px_rgb(1_66_111/0.08)]">
      {show ? (
        <iframe src={SRC} title="AquaSentinel demo presentation (PowerPoint)" className="absolute inset-0 size-full" allowFullScreen />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <Presentation className="mx-auto size-10 text-lp-cyan" aria-hidden />
            <button
              onClick={() => setShow(true)}
              className="mt-4 inline-flex min-h-[52px] items-center rounded-full bg-lp-blue-deep px-7 text-[17px] font-medium text-white transition hover:brightness-110"
            >
              View presentation
            </button>
            <p className="mx-auto mt-3 max-w-md text-sm text-lp-body">
              Opens in Microsoft&rsquo;s PowerPoint viewer, which may set its own cookies.{" "}
              <Link href="/cookies" className="font-medium text-lp-blue underline decoration-lp-cyan underline-offset-4">Cookies</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
