import DecorativeVideo from "@/components/DecorativeVideo";

type IntroVideoProps = {
  src: string;
  fallbackPoster?: string;
  fallbackSizes?: string;
  fallbackQuality?: number;
  fallbackPosterClassName?: string;
  className?: string;
  videoClassName?: string;
};

export default function IntroVideo({
  src,
  fallbackPoster,
  fallbackSizes,
  fallbackQuality,
  fallbackPosterClassName,
  className = "",
  videoClassName = "",
}: IntroVideoProps) {
  return (
    <DecorativeVideo
      src={src}
      fallbackPoster={fallbackPoster}
      fallbackSizes={fallbackSizes}
      fallbackQuality={fallbackQuality}
      fallbackPosterClassName={fallbackPosterClassName}
      videoClassName={videoClassName}
      playbackRate={1}
      preload="none"
      deferUntilVisible
      className={className}
    />
  );
}
