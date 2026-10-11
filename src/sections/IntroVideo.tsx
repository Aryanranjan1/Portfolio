import DecorativeVideo from "@/components/DecorativeVideo";

type IntroVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

export default function IntroVideo({ src, poster, className = "" }: IntroVideoProps) {
  return (
    <DecorativeVideo
      src={src}
      poster={poster}
      playbackRate={1}
      preload="none"
      className={className}
    />
  );
}
