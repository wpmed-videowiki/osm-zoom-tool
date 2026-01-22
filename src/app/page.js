import { redirect } from "next/navigation";

export default async function Home(props) {
  const searchParams = await props.searchParams;
  redirect(`/home?${new URLSearchParams(searchParams).toString()}`);
}
