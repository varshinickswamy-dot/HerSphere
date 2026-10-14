import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Checkbox.module.css';
import { Check } from 'lucide-react';
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={styles.checkboxWrapper}>