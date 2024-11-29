import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useMemo } from "react";
import { AudioFormat } from "../types";

type Props = {
  items: string[];
  value: string;
  setValue: (value: AudioFormat) => void;
};

export const Selector = ({ items, value, setValue }: Props) => {
  const itemsSection = useMemo(() => {
    return items.map((item) => (
      <ToggleGroup.Item key={`formatselector-${item}`} value={item} className="rounded px-4 max-md:px-2 py-1 transition hover:bg-gray-100 data-[state=on]:bg-gray-700 data-[state=on]:text-white">
        {item}
      </ToggleGroup.Item>
    ));
  }, [items]);

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(value) => {
        if (value) setValue(value as AudioFormat);
      }}
      className="rounded border px-2 py-1 flex gap-2 w-full justify-between"
    >
      {itemsSection}
    </ToggleGroup.Root>
  );
};
