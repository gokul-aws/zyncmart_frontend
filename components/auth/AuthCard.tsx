import Card from '@/components/ui/Card';

interface AuthCardProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shared centred layout for sign-in, registration and password recovery. */
export default function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        <Card padding="lg">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
        </Card>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
