import { redirect } from "next/navigation";

export default function Home({searchParams}) {
  redirect(`/home?${new URLSearchParams(searchParams).toString()}`);
}
