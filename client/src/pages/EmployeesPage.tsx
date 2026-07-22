import type { Employee } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

export function EmployeesPage() {
  const { data, isLoading, error, remove } = useApiResource<Employee[]>('/employees');

  return (
    <>
      <PageHeader title="Employees" description="Add, edit, delete, and view employee profiles." />
      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={!data?.length}
        emptyMessage="No employees found."
      >
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Join Date</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data?.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-950">{employee.fullName}</p>
                      <p className="text-zinc-500">{employee.position} · {employee.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{employee.phone}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatDate(employee.joinDate)}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatCurrency(employee.monthlySalary)}</td>
                    <td className="px-4 py-3"><StatusBadge status={employee.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmDeleteButton
                        label={employee.fullName}
                        onConfirm={() => remove(employee.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </DataState>
    </>
  );
}
