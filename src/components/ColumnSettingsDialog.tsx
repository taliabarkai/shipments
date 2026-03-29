import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface Column {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export default function ColumnSettingsDialog({ isOpen, onClose, columns, onColumnsChange }: ColumnSettingsDialogProps) {
  const toggleColumn = (columnId: string) => {
    onColumnsChange(
      columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const resetColumns = () => {
    onColumnsChange(columns.map(col => ({ ...col, visible: true })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Column Settings</DialogTitle>
          <DialogDescription>
            Select which columns to display in the shipments table.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-[0px]">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {columns.map(column => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumn(column.id)}
                  className="data-[state=checked]:bg-[#1976d2] data-[state=checked]:border-[#1976d2]"
                />
                <Label htmlFor={`column-${column.id}`} className="cursor-pointer">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={resetColumns} variant="outline" className="flex-1">
              Reset to Default
            </Button>
            <Button onClick={onClose} className="flex-1 bg-[#1976d2] hover:bg-[#1565c0]">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}