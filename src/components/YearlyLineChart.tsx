import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export type YearlySeries = {
  label: string;
  values: number[];
  borderColor: string;
  backgroundColor?: string;
  fill?: boolean;
};

export function YearlyLineChart({
  years,
  series,
  valueFormatter,
}: {
  years: number[];
  series: YearlySeries[];
  valueFormatter: (n: number) => string;
}) {
  const data: ChartData<'line'> = {
    labels: years.map((y) => String(y)),
    datasets: series.map((s) => ({
      label: s.label,
      data: s.values,
      borderColor: s.borderColor,
      backgroundColor: s.backgroundColor ?? s.borderColor,
      fill: s.fill ?? false,
      tension: 0.25,
      pointRadius: 0,
      pointHitRadius: 10,
      borderWidth: 2,
    })),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255,255,255,0.70)',
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label ?? '';
            const v = typeof ctx.parsed.y === 'number' ? ctx.parsed.y : 0;
            return `${label}: ${valueFormatter(v)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.55)' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: {
          color: 'rgba(255,255,255,0.55)',
          callback: (value) => valueFormatter(Number(value)),
        },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
