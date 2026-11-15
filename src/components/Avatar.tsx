// Files in public/profile-pics are named after the member, lowercased.
// Plain <img> on purpose: next/image's optimizer fetches the file server-side without the
// auth cookie, so the middleware would redirect it to /login.
export default function Avatar({ member, size = 40 }: { member: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/profile-pics/${member.toLowerCase()}.png`}
      alt={member}
      width={size}
      height={size}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
