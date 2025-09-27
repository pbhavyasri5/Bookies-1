import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const categories = [
  "All Categories",
  "Fiction",
  "Science",
  "History",
  "Biography",
  "Children",
  "Technology",
  "Art",
  "Philosophy",
  "Mathematics",
  "Literature",
  "Health",
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px] bg-background border-border">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}