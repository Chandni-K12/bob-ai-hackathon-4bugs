import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function getPerformanceColor(score) {
  if (score >= 85) return 'text-eco-green';
  if (score >= 70) return 'text-eco-amber';
  return 'text-eco-rose';
}

export function getPerformanceLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  return 'Needs Improvement';
}
