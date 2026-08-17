import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string;
  action?: React.ReactNode | {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action,
  children
}) => {
  return (
    <div className="mb-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs transition-all">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium overflow-x-auto py-0.5 mb-3">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
              {item.to ? (
                <Link
                  to={item.to}
                  className="hover:text-teal-700 transition-colors duration-150 font-medium whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-bold whitespace-nowrap">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main row: Title & Description + Top Right Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {action && (
          <div className="shrink-0">
            {React.isValidElement(action) ? (
              action
            ) : typeof action === 'object' && 'label' in action ? (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                className="shadow-sm font-bold text-xs"
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {children && <div className="mt-4 pt-4 border-t border-slate-100">{children}</div>}
    </div>
  );
};
