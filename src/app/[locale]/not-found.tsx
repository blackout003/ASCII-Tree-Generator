import { AppLayout } from '@/components/tools-nav/app-layout';
import { NotFoundContent } from '@/components/not-found/not-found-content';

export default function NotFound() {
  return (
    <AppLayout>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <NotFoundContent />
      </div>
    </AppLayout>
  );
}
