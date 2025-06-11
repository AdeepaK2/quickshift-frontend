declare module "@/components/ui/select" {
  import * as React from "react";
  export interface SelectProps {
    options: { label: string; value: string | number }[];
    value: string | number;    onChange: (value: string) => void;
    className?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    [key: string]: unknown;
  }
  const Select: React.FC<SelectProps>;
  export default Select;
}
