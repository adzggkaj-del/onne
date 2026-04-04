import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

interface EditableDateCellProps {
  value: string;
  onSave: (newDate: string) => void;
}

const toLocalDatetimeStr = (iso: string) => {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

const EditableDateCell = ({ value, onSave }: EditableDateCellProps) => {
  const [open, setOpen] = useState(false);
  const [localVal, setLocalVal] = useState(() => toLocalDatetimeStr(value));

  const handleSave = () => {
    const isoDate = new Date(localVal).toISOString();
    onSave(isoDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setLocalVal(toLocalDatetimeStr(value)); }}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap hover:text-foreground group">
          {new Date(value).toLocaleString("ko-KR")}
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 space-y-2" align="start">
        <Input
          type="datetime-local"
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          className="text-sm"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>취소</Button>
          <Button size="sm" onClick={handleSave}>저장</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditableDateCell;
