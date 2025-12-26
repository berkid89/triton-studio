interface InfoFieldProps {
  label: string;
  value: string | number;
}

export function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 mb-3">{label}</h3>
      <p className="text-sm text-gray-100">{value}</p>
    </div>
  );
}

