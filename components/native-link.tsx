import type { ComponentPropsWithoutRef } from "react";

type NativeLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

/**
 * Hosting-safe internal navigation. A native anchor keeps every destination
 * usable before hydration and if the client router is unavailable.
 */
export default function NativeLink({ href, children, ...props }: NativeLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
