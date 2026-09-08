import Link from "next/link";
import { NotFoundIllustration } from "@/components/aurelia/illustrations";
import { SparkleIcon } from "@/components/aurelia/icons";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-6 text-center">
      <NotFoundIllustration className="w-40 h-36" aria-hidden />
      <p className="eyebrow text-ink-400 mt-6">Lost your way?</p>
      <h1 className="font-display text-[28px] leading-[34px] text-ink mt-2">This mirror is empty</h1>
      <p className="text-[14px] leading-[21px] text-ink-2 mt-3 max-w-[300px]">
        The page you were looking for isn&apos;t here — but everything you love is one tap away.
      </p>
      <Link
        href="/"
        className="mt-8 h-12 px-7 rounded-full bg-rose text-white text-[15px] font-bold press inline-flex items-center gap-2"
      >
        <SparkleIcon width={17} height={17} />
        Back to Aurelia
      </Link>
    </div>
  );
}
