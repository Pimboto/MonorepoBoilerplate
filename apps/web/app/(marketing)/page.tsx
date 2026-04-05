import NextLink from 'next/link';
import { subtitle, title } from '@/components/primitives';
import { CustomButton } from '@/components/ui/CustomButton';

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Create with&nbsp;</span>
        <span className={title({ color: 'blue' })}>AI&nbsp;</span>
        <br />
        <span className={title()}>powered by your own workflows.</span>
        <div className={subtitle({ class: 'mt-4' })}>
          Run ComfyUI workflows serverlessly. Manage your AI-generated collections effortlessly.
        </div>
      </div>

      <div className="flex gap-3">
        <NextLink href="/signup">
          <CustomButton variant="primary">Get Started</CustomButton>
        </NextLink>
        <NextLink href="/login">
          <CustomButton variant="outline">Sign In</CustomButton>
        </NextLink>
      </div>
    </section>
  );
}
