import { Select, type SelectOption, type SelectProps } from '@/components/ui/Select';

/**
 * @deprecated Import `Select` from `@/components/ui` or `@/components/ui/Select` instead of `Dropdown` from `@/shared/ui/Dropdown`.
 */
export type DropdownOption = SelectOption;
export type DropdownProps = SelectProps;
export const Dropdown = Select;
