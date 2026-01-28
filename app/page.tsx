import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to Argos MVP</h1>
      <p className="mt-4 text-lg">This is the main page of the Argos MVP application.</p>
      <Image
        src="/argos-logo.png"
        alt="Argos Logo"
        width={200}
        height={200}
        className="mt-8"
      />
    </main>
  );
}
