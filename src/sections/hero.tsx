import Image from "next/image";

// src/sections/Hero.tsx

export default function Hero() {
  return (
    <section className="min-h-svh w-full">
      {/* Hero content will go here */}
            <Image
              src="/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
        

    </section>
  );
}