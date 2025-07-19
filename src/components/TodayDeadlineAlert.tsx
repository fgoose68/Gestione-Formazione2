import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Deadline } from '@/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface TodayDeadlineAlertProps {
  deadline: Deadline;
  onDismiss: (eventId: string, type: Deadline['type']) => void;
}

export const TodayDeadlineAlert = ({ deadline, onDismiss }: TodayDeadlineAlertProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss(deadline.eventId, deadline.type);
  };

  return (
    <Alert className="mb-4 bg-yellow-100 border-yellow-400 text-yellow-800 relative pr-10">
      <AlertTitle className="flex items-center justify-between">
        <span className="font-bold text-lg">Scadenza di Oggi: {deadline.eventTitle}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-yellow-800 hover:bg-yellow-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p className="text-base">{deadline.message}</p>
        <p className="text-sm mt-1">Data: {format(deadline.date, "PPP", { locale: it })}</p>
      </AlertDescription>
    </Alert>
  );
};