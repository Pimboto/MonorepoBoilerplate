import { GithubIcon } from '@/components/icons';
import { subtitle, title } from '@/components/primitives';
import { CustomButton } from '@/components/ui/CustomButton';

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Make&nbsp;</span>
        <span className={title({ color: 'blue' })}>beautiful&nbsp;</span>
        <br />
        <span className={title()}>websites regardless of your design experience.</span>
        <div className={subtitle({ class: 'mt-4' })}>
          Beautiful, fast and modern React UI library.
        </div>
      </div>

      <div className="flex gap-3">
        <CustomButton
          href="https://v3.heroui.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
        >
          Documentation
        </CustomButton>
        <CustomButton
          href="https://github.com/heroui-inc/heroui"
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
        >
          <GithubIcon size={20} />
          GitHub
        </CustomButton>
      </div>

      <div className="mt-8">
        <div className="px-4 py-3 rounded-lg border border-border bg-surface/50">
          <span>
            Get started by editing{' '}
            <code className="text-primary font-mono text-sm bg-surface px-2 py-1 rounded">
              app/page.tsx
            </code>
          </span>
        </div>
      </div>
    </section>
  );
}
