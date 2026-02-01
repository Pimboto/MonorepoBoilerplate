import {
  Add,
  DocumentDownload,
  Edit,
  Global,
  Heart,
  Notification,
  SearchNormal1,
  Setting2,
  Sms,
  Star1,
  TickCircle,
  Trash,
} from 'iconsax-react';
import { CustomButton } from '@/components/ui/CustomButton';

export default function Buttons() {
  return (
    <div className="space-y-20">
      <div className="flex flex-col gap-12">
        {/* PRIMARY */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton size="sm">
            <Add size="18" color="currentColor" variant="Outline" />
            Primary
          </CustomButton>
          <CustomButton size="md">
            <SearchNormal1 size="18" color="currentColor" variant="Outline" />
            Primary
          </CustomButton>
          <CustomButton size="lg">
            <TickCircle size="18" color="currentColor" variant="Outline" />
            Primary
          </CustomButton>
        </div>

        {/* SECONDARY */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton variant="secondary" size="sm">
            <Setting2 size="18" color="currentColor" variant="Outline" />
            Secondary
          </CustomButton>
          <CustomButton variant="secondary" size="md">
            <Edit size="18" color="currentColor" variant="Outline" />
            Secondary
          </CustomButton>
          <CustomButton variant="secondary" size="lg">
            <DocumentDownload size="18" color="currentColor" variant="Outline" />
            Secondary
          </CustomButton>
        </div>

        {/* TERTIARY */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton variant="tertiary" size="sm">
            <Sms size="18" color="currentColor" variant="Outline" />
            Tertiary
          </CustomButton>
          <CustomButton variant="tertiary" size="md">
            <Notification size="18" color="currentColor" variant="Outline" />
            Tertiary
          </CustomButton>
          <CustomButton variant="tertiary" size="lg">
            <Star1 size="18" color="currentColor" variant="Outline" />
            Tertiary
          </CustomButton>
        </div>

        {/* OUTLINE */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton variant="ghost" size="sm">
            <Global size="18" color="currentColor" variant="Outline" />
            Outline
          </CustomButton>
          <CustomButton variant="ghost" size="md">
            <Heart size="18" color="currentColor" variant="Outline" />
            Outline
          </CustomButton>
          <CustomButton variant="ghost" size="lg">
            <Edit size="18" color="currentColor" variant="Outline" />
            Outline
          </CustomButton>
        </div>

        {/* GHOST */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton variant="ghost" size="sm">
            <Setting2 size="18" color="currentColor" variant="Outline" />
            Ghost
          </CustomButton>
          <CustomButton variant="ghost" size="md">
            <SearchNormal1 size="18" color="currentColor" variant="Outline" />
            Ghost
          </CustomButton>
          <CustomButton variant="ghost" size="lg">
            <Add size="18" color="currentColor" variant="Outline" />
            Ghost
          </CustomButton>
        </div>

        {/* DANGER */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton variant="danger" size="sm">
            <Trash size="18" color="currentColor" variant="Outline" />
            Danger
          </CustomButton>
          <CustomButton variant="danger" size="md">
            <Trash size="18" color="currentColor" variant="Outline" />
            Danger
          </CustomButton>
          <CustomButton variant="danger" size="lg">
            <Trash size="18" color="currentColor" variant="Outline" />
            Danger
          </CustomButton>
        </div>

        {/* DANGER SOFT / FLAT */}
        <div className="flex items-center justify-center gap-4">
          <CustomButton variant="danger-soft" size="sm">
            <Trash size="18" color="currentColor" variant="Outline" />
            Danger Soft
          </CustomButton>
          <CustomButton variant="danger-soft" size="md">
            <Trash size="18" color="currentColor" variant="Outline" />
            Danger Soft
          </CustomButton>
          <CustomButton variant="danger-soft" size="lg">
            <Trash size="18" color="currentColor" variant="Outline" />
            Danger Soft
          </CustomButton>
        </div>

        {/* ICON ONLY */}
        <div className="space-y-8">
          <div className="flex items-center justify-center gap-4">
            <CustomButton isIconOnly size="sm" aria-label="Plus">
              <Add size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="secondary" size="sm" aria-label="Settings">
              <Setting2 size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="tertiary" size="sm" aria-label="Search">
              <SearchNormal1 size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="ghost" size="sm" aria-label="Heart">
              <Heart size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="ghost" size="sm" aria-label="Bell">
              <Notification size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="danger" size="sm" aria-label="Delete">
              <Trash size="18" color="currentColor" variant="Outline" />
            </CustomButton>
          </div>

          <div className="flex items-center justify-center gap-4">
            <CustomButton isIconOnly size="md" aria-label="Check">
              <TickCircle size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="secondary" size="md" aria-label="Edit">
              <Edit size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="tertiary" size="md" aria-label="Download">
              <DocumentDownload size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="ghost" size="md" aria-label="Globe">
              <Global size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="ghost" size="md" aria-label="Star">
              <Star1 size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="danger" size="md" aria-label="Delete">
              <Trash size="18" color="currentColor" variant="Outline" />
            </CustomButton>
          </div>

          <div className="flex items-center justify-center gap-4">
            <CustomButton isIconOnly size="lg" aria-label="Heart">
              <Heart size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="secondary" size="lg" aria-label="Settings">
              <Setting2 size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="tertiary" size="lg" aria-label="Envelope">
              <Sms size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="ghost" size="lg" aria-label="Plus">
              <Add size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="ghost" size="lg" aria-label="Search">
              <SearchNormal1 size="18" color="currentColor" variant="Outline" />
            </CustomButton>
            <CustomButton isIconOnly variant="danger" size="lg" aria-label="Delete">
              <Trash size="18" color="currentColor" variant="Outline" />
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
