import * as RadixSlider from "@radix-ui/react-slider";

type Props = {
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
};

export const Slider = ({
    value,
    setValue,
    min,
    max,
    step,
}:Props) => (
  <RadixSlider.Root value={[value]} min={min} max={max} step={step} onValueChange={(value)=>setValue(value[0])} className="relative flex w-full h-[20px] select-none touch-none" >
    <RadixSlider.Track className="w-full h-[10px] border rounded translate-y-[5px]">
      <RadixSlider.Range />
    </RadixSlider.Track>
    <RadixSlider.Thumb className="block size-5 bg-gray-700 border rounded-full shadow-2xl"/>
  </RadixSlider.Root>
);
