import { Button } from '@/components/form/CustomButton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductRegistrationHeaderProps {
  title?: string;
  subtitle?: string;
}

export const ProductRegistrationHeader: React.FC<ProductRegistrationHeaderProps> = ({
  title = 'Add Part & Accessories',
  subtitle = 'Add a new product to the system'
}) => {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};